# LearnQuest — Supabase Backend Setup

This project now runs on a real Supabase backend: Postgres tables, row-level
security, and secure server-side functions instead of `localStorage`/mock data.

## What changed

- **Auth**: real Supabase Auth accounts. The UI still logs in with a
  *username*, which is deterministically mapped to an internal email
  (`username@learnquest.internal`) — no real email required.
- **Data**: `profiles`, `courses`, `projects`, `project_submissions` tables in
  Postgres, guarded by row-level security.
- **Anti-cheat**: XP, streaks, badges, and completions are never written
  directly by the browser. They go through Postgres RPC functions
  (`rpc_complete_subtopic`, `rpc_submit_project`, `rpc_review_submission`, ...)
  that look up trusted values (like a subtopic's XP) server-side.
- **User provisioning**: creating/deleting members and resetting passwords
  requires Supabase's Admin API (a service-role key), which must never touch
  the browser. That logic lives in the `admin-users` Edge Function.

## 1. Create a Supabase project

Go to https://supabase.com/dashboard, create a project, and grab from
**Project Settings -> API**:
- Project URL
- `anon` public key
- `service_role` key (keep this secret — server-side only)

## 2. Run the database migrations

In the Supabase Dashboard SQL Editor, run these two files in order (or via
`supabase db push` if you use the CLI with this repo's `supabase/` folder):

1. `supabase/migrations/0001_init.sql` — tables, RLS policies, RPC functions
2. `supabase/migrations/0002_seed_courses_projects.sql` — the 4 starter
   courses and 4 projects from the original demo content

## 3. Deploy the admin Edge Function

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase functions deploy admin-users
```

No extra secrets to set — `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are
injected automatically for Edge Functions by Supabase.

## 4. Create the first admin account

The app has no signup form (accounts are admin-issued, matching the original
design), so bootstrap one admin directly with the service role key — never
from the browser:

```bash
SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
node scripts/bootstrap-admin.mjs admin "SomeStrongPassword123" "Your Name"
```

From then on, use **Admin -> Members** in the app itself to add/remove
learners and reset their passwords — real people you provide.

## 5. Configure the frontend

```bash
cp .env.example .env
```

Fill in `.env`:
```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 6. Run it

```bash
npm install
npm run dev
```

Log in at `/login` with the admin username/password from step 4.

## Security model, in short

| Data | Who can read | Who can write | How |
|---|---|---|---|
| `profiles` | any signed-in user | nobody directly | RPCs / Edge Function only |
| `courses`, `projects` | any signed-in user | admins | RLS-gated direct table writes |
| `project_submissions` | own rows; admins see all | nobody directly | `rpc_submit_project`, `rpc_review_submission` |
| Auth accounts (create/reset/delete) | — | admins only | `admin-users` Edge Function, verified server-side |

XP values for completing a subtopic are read from the `courses.topics` JSON
tree **inside the database function**, not trusted from the client — so a
user editing browser requests can't grant themselves arbitrary XP.
