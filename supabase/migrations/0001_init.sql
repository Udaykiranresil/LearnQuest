-- LearnQuest — core schema, RLS, and secure RPC functions.
-- Run this once against your Supabase project (SQL Editor, or `supabase db push`).

create extension if not exists pgcrypto;

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  role text not null default 'user' check (role in ('user','admin')),
  xp integer not null default 0,
  streak integer not null default 0,
  last_active_date timestamptz,
  completed_ids text[] not null default '{}',
  badges text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id text primary key,
  title text not null,
  description text,
  icon text,
  difficulty text,
  topics jsonb not null default '[]',
  project_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key,
  course_id text references public.courses(id) on delete set null,
  title text not null,
  description text,
  requirements text[] not null default '{}',
  xp_reward integer not null default 0,
  difficulty text,
  created_at timestamptz not null default now()
);

create table if not exists public.project_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id text not null references public.projects(id) on delete cascade,
  repo_url text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_at timestamptz not null default now(),
  unique (user_id, project_id)
);

-- Add the courses -> projects FK now that projects exists (nullable, informational only).
alter table public.courses
  drop constraint if exists courses_project_id_fkey;
alter table public.courses
  add constraint courses_project_id_fkey foreign key (project_id) references public.projects(id) on delete set null;

-- ============================================================
-- HELPERS
-- ============================================================

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Recursively find a leaf subtopic's xp value inside a topics jsonb tree.
create or replace function public.find_leaf_xp(nodes jsonb, target_id text) returns integer
language plpgsql immutable as $$
declare
  n jsonb;
  found integer;
begin
  for n in select * from jsonb_array_elements(coalesce(nodes, '[]'::jsonb)) loop
    if n->>'id' = target_id then
      return coalesce((n->>'xp')::integer, 0);
    end if;
    if n ? 'children' then
      found := public.find_leaf_xp(n->'children', target_id);
      if found is not null then
        return found;
      end if;
    end if;
  end loop;
  return null;
end;
$$;

-- Recursively collect every leaf (completable) subtopic id in a topics jsonb tree.
create or replace function public.collect_leaf_ids(nodes jsonb) returns text[]
language plpgsql immutable as $$
declare
  n jsonb;
  out_ids text[] := '{}';
begin
  for n in select * from jsonb_array_elements(coalesce(nodes, '[]'::jsonb)) loop
    if n ? 'children' and jsonb_array_length(n->'children') > 0 then
      out_ids := out_ids || public.collect_leaf_ids(n->'children');
    else
      out_ids := out_ids || (n->>'id');
    end if;
  end loop;
  return out_ids;
end;
$$;

-- Recomputes streak + badge unlocks for a user. Mirrors the client's gameLogic.js
-- rules exactly, but runs server-side so it can't be forged.
create or replace function public.recompute_progress(p_user_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  u public.profiles%rowtype;
  c record;
  leaf_ids text[];
  courses_completed integer := 0;
  approved_count integer;
  submitted_count integer;
  new_badges text[] := '{}';
  today date := (now() at time zone 'utc')::date;
  last_date date;
  diff integer;
  new_streak integer;
begin
  select * into u from public.profiles where id = p_user_id;
  if not found then return; end if;

  if u.last_active_date is null then
    new_streak := 1;
  else
    last_date := (u.last_active_date at time zone 'utc')::date;
    diff := today - last_date;
    if diff = 0 then
      new_streak := u.streak;
    elsif diff = 1 then
      new_streak := u.streak + 1;
    else
      new_streak := 1;
    end if;
  end if;

  for c in select topics from public.courses loop
    leaf_ids := public.collect_leaf_ids(c.topics);
    if array_length(leaf_ids, 1) > 0 and leaf_ids <@ u.completed_ids then
      courses_completed := courses_completed + 1;
    end if;
  end loop;

  select count(*) into submitted_count from public.project_submissions where user_id = p_user_id;
  select count(*) into approved_count from public.project_submissions where user_id = p_user_id and status = 'approved';

  if coalesce(array_length(u.completed_ids,1),0) >= 1 and not ('first-step' = any(u.badges)) then
    new_badges := new_badges || 'first-step';
  end if;
  if coalesce(array_length(u.completed_ids,1),0) >= 10 and not ('ten-marks' = any(u.badges)) then
    new_badges := new_badges || 'ten-marks';
  end if;
  if courses_completed >= 1 and not ('chapter-closed' = any(u.badges)) then
    new_badges := new_badges || 'chapter-closed';
  end if;
  if new_streak >= 7 and not ('iron-streak' = any(u.badges)) then
    new_badges := new_badges || 'iron-streak';
  end if;
  if new_streak >= 30 and not ('unbroken' = any(u.badges)) then
    new_badges := new_badges || 'unbroken';
  end if;
  if submitted_count >= 1 and not ('architect' = any(u.badges)) then
    new_badges := new_badges || 'architect';
  end if;
  if approved_count >= 1 and not ('shipped' = any(u.badges)) then
    new_badges := new_badges || 'shipped';
  end if;
  if courses_completed >= 3 and not ('polymath' = any(u.badges)) then
    new_badges := new_badges || 'polymath';
  end if;

  update public.profiles
  set streak = new_streak,
      last_active_date = now(),
      badges = u.badges || new_badges
  where id = p_user_id;
end;
$$;

-- ============================================================
-- MUTATION RPCs (the only way xp/completions/submissions change)
-- ============================================================

create or replace function public.rpc_complete_subtopic(p_subtopic_id text) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_xp integer;
  c record;
  v_already boolean;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  select (p_subtopic_id = any(completed_ids)) into v_already from public.profiles where id = v_uid;
  if v_already then return; end if;

  for c in select topics from public.courses loop
    v_xp := public.find_leaf_xp(c.topics, p_subtopic_id);
    exit when v_xp is not null;
  end loop;

  if v_xp is null then
    raise exception 'subtopic % not found in any course', p_subtopic_id;
  end if;

  update public.profiles
  set xp = xp + v_xp,
      completed_ids = completed_ids || p_subtopic_id
  where id = v_uid;

  perform public.recompute_progress(v_uid);
end;
$$;

create or replace function public.rpc_uncomplete_subtopic(p_subtopic_id text) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_xp integer;
  c record;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  for c in select topics from public.courses loop
    v_xp := public.find_leaf_xp(c.topics, p_subtopic_id);
    exit when v_xp is not null;
  end loop;
  v_xp := coalesce(v_xp, 0);

  update public.profiles
  set xp = greatest(0, xp - v_xp),
      completed_ids = array_remove(completed_ids, p_subtopic_id)
  where id = v_uid;
end;
$$;

create or replace function public.rpc_submit_project(p_project_id text, p_repo_url text) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if p_repo_url is null or length(trim(p_repo_url)) = 0 then
    raise exception 'repo url required';
  end if;
  if not exists (select 1 from public.projects where id = p_project_id) then
    raise exception 'project % not found', p_project_id;
  end if;

  insert into public.project_submissions (user_id, project_id, repo_url, status, submitted_at)
  values (v_uid, p_project_id, p_repo_url, 'pending', now())
  on conflict (user_id, project_id)
  do update set repo_url = excluded.repo_url, status = 'pending', submitted_at = now();

  perform public.recompute_progress(v_uid);
end;
$$;

create or replace function public.rpc_review_submission(p_user_id uuid, p_project_id text, p_status text) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_xp integer;
  v_already_approved boolean;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;
  if p_status not in ('approved','rejected','pending') then
    raise exception 'invalid status %', p_status;
  end if;

  select (status = 'approved') into v_already_approved
  from public.project_submissions where user_id = p_user_id and project_id = p_project_id;

  update public.project_submissions
  set status = p_status
  where user_id = p_user_id and project_id = p_project_id;

  if p_status = 'approved' and not coalesce(v_already_approved, false) then
    select xp_reward into v_xp from public.projects where id = p_project_id;
    update public.profiles set xp = xp + coalesce(v_xp,0) where id = p_user_id;
  end if;

  perform public.recompute_progress(p_user_id);
end;
$$;

grant execute on function public.rpc_complete_subtopic(text) to authenticated;
grant execute on function public.rpc_uncomplete_subtopic(text) to authenticated;
grant execute on function public.rpc_submit_project(text, text) to authenticated;
grant execute on function public.rpc_review_submission(uuid, text, text) to authenticated;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.projects enable row level security;
alter table public.project_submissions enable row level security;

-- profiles: any signed-in user can read (needed for leaderboard + admin panel).
-- No client-side INSERT/UPDATE/DELETE policy exists on purpose — all writes
-- happen through the RPCs above or the service-role admin Edge Function.
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (auth.role() = 'authenticated');

-- courses: readable by anyone signed in, writable by admins only.
drop policy if exists "courses_select" on public.courses;
create policy "courses_select" on public.courses
  for select using (auth.role() = 'authenticated');
drop policy if exists "courses_admin_write" on public.courses;
create policy "courses_admin_write" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

-- projects: same pattern as courses.
drop policy if exists "projects_select" on public.projects;
create policy "projects_select" on public.projects
  for select using (auth.role() = 'authenticated');
drop policy if exists "projects_admin_write" on public.projects;
create policy "projects_admin_write" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

-- project_submissions: users see their own, admins see everything.
-- No direct write policy — writes go through rpc_submit_project /
-- rpc_review_submission so status/xp can't be forged by the client.
drop policy if exists "submissions_select_own_or_admin" on public.project_submissions;
create policy "submissions_select_own_or_admin" on public.project_submissions
  for select using (user_id = auth.uid() or public.is_admin());
