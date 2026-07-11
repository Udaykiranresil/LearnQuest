import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { supabase, usernameToEmail } from "../lib/supabaseClient";
import { getRankForXp } from "../lib/gameLogic";

const AppContext = createContext(null);

// ---- Row <-> app-shape mapping -------------------------------------------
// Keeps every page component exactly as it was written against the old
// mock-data layer (camelCase, nested projectSubmissions per user, etc).

function mapCourseRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    difficulty: row.difficulty,
    topics: row.topics || [],
    projectId: row.project_id,
  };
}

function mapProjectRow(row) {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    requirements: row.requirements || [],
    xpReward: row.xp_reward,
    difficulty: row.difficulty,
  };
}

function mapSubmissionRow(row) {
  return {
    projectId: row.project_id,
    repoUrl: row.repo_url,
    status: row.status,
    submittedAt: row.submitted_at,
  };
}

function mapProfileRow(row, submissionsByUser) {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    displayName: row.display_name,
    xp: row.xp,
    streak: row.streak,
    lastActiveDate: row.last_active_date,
    completedIds: row.completed_ids || [],
    badges: row.badges || [],
    projectSubmissions: (submissionsByUser[row.id] || []).map(mapSubmissionRow),
  };
}

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [ready, setReady] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refreshAll = useCallback(async () => {
    const [profilesRes, coursesRes, projectsRes, submissionsRes] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("courses").select("*").order("created_at", { ascending: true }),
      supabase.from("projects").select("*").order("created_at", { ascending: true }),
      supabase.from("project_submissions").select("*"),
    ]);

    if (!mounted.current) return;

    const submissionsByUser = {};
    for (const row of submissionsRes.data || []) {
      (submissionsByUser[row.user_id] ||= []).push(row);
    }

    setUsers((profilesRes.data || []).map((row) => mapProfileRow(row, submissionsByUser)));
    setCourses((coursesRes.data || []).map(mapCourseRow));
    setProjects((projectsRes.data || []).map(mapProjectRow));
  }, []);

  useEffect(() => {
    let subscription;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setCurrentUserId(data.session.user.id);
        await refreshAll();
      }
      if (mounted.current) setReady(true);

      const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setCurrentUserId(session.user.id);
          await refreshAll();
        } else {
          setCurrentUserId(null);
          setUsers([]);
          setCourses([]);
          setProjects([]);
        }
      });
      subscription = sub.subscription;
    })();

    return () => subscription?.unsubscribe();
  }, [refreshAll]);

  const currentUser = users.find((u) => u.id === currentUserId) || null;

  // --- Celebration events (level-up, badge unlock) --------------------------
  // Tracked centrally rather than per-page so a rank-up or badge earned via
  // ANY path (completing a subtopic, an admin approving a project, etc.)
  // reliably triggers its celebration wherever the user happens to be.
  const [levelUpEvent, setLevelUpEvent] = useState(null);
  const [badgeQueue, setBadgeQueue] = useState([]);
  const celebrationBaseline = useRef({ userId: null, xp: null, badges: null });

  useEffect(() => {
    if (!currentUser) {
      celebrationBaseline.current = { userId: null, xp: null, badges: null };
      return;
    }
    const baseline = celebrationBaseline.current;

    // First time we see this user (fresh login/page load) — record a
    // baseline silently. We never want a celebration for state the user
    // already had before we started watching.
    if (baseline.userId !== currentUser.id) {
      celebrationBaseline.current = {
        userId: currentUser.id,
        xp: currentUser.xp,
        badges: currentUser.badges,
      };
      return;
    }

    if (currentUser.xp > baseline.xp) {
      const prevRank = getRankForXp(baseline.xp);
      const newRank = getRankForXp(currentUser.xp);
      if (newRank.level > prevRank.level) {
        setLevelUpEvent({ level: newRank.level, name: newRank.name });
      }
    }

    const newlyEarned = currentUser.badges.filter((b) => !baseline.badges.includes(b));
    if (newlyEarned.length > 0) {
      setBadgeQueue((q) => [...q, ...newlyEarned]);
    }

    celebrationBaseline.current = {
      userId: currentUser.id,
      xp: currentUser.xp,
      badges: currentUser.badges,
    };
  }, [currentUser]);

  const dismissLevelUp = useCallback(() => setLevelUpEvent(null), []);
  const dismissBadge = useCallback(() => setBadgeQueue((q) => q.slice(1)), []);

  const login = useCallback(async (username, password) => {
    const email = usernameToEmail(username);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      return { ok: false, error: "Username or password is incorrect." };
    }
    setCurrentUserId(data.session.user.id);
    await refreshAll();
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.session.user.id)
      .single();
    if (!profileRow) {
      await supabase.auth.signOut();
      return { ok: false, error: "No profile found for this account. Contact an administrator." };
    }
    return { ok: true, user: mapProfileRow(profileRow, {}) };
  }, [refreshAll]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUserId(null);
    setUsers([]);
    setCourses([]);
    setProjects([]);
  }, []);

  // Verifies the current password by re-authenticating, then updates it via
  // Supabase Auth. Passwords now live only in Supabase Auth, never in the
  // profiles table, so there's nothing to compare client-side anymore.
  const changePassword = useCallback(async (_userId, newPassword, currentPassword) => {
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email;
    if (!email) return { ok: false, error: "Not signed in." };

    if (currentPassword !== undefined) {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (reauthError) return { ok: false, error: "Current password is incorrect." };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const completeSubtopic = useCallback(
    async (userId, subtopicId) => {
      const before = currentUser?.badges || [];
      const { error } = await supabase.rpc("rpc_complete_subtopic", { p_subtopic_id: subtopicId });
      if (error) {
        console.error("completeSubtopic failed:", error.message);
        return [];
      }
      await refreshAll();
      const { data: freshRow } = await supabase
        .from("profiles")
        .select("badges")
        .eq("id", userId)
        .single();
      const after = freshRow?.badges || before;
      return after.filter((b) => !before.includes(b));
    },
    [refreshAll, currentUser]
  );

  const uncompleteSubtopic = useCallback(
    async (_userId, subtopicId) => {
      const { error } = await supabase.rpc("rpc_uncomplete_subtopic", { p_subtopic_id: subtopicId });
      if (error) console.error("uncompleteSubtopic failed:", error.message);
      await refreshAll();
    },
    [refreshAll]
  );

  const submitProject = useCallback(
    async (_userId, projectId, repoUrl) => {
      const { error } = await supabase.rpc("rpc_submit_project", {
        p_project_id: projectId,
        p_repo_url: repoUrl,
      });
      if (error) console.error("submitProject failed:", error.message);
      await refreshAll();
    },
    [refreshAll]
  );

  const reviewSubmission = useCallback(
    async (userId, projectId, status) => {
      const { error } = await supabase.rpc("rpc_review_submission", {
        p_user_id: userId,
        p_project_id: projectId,
        p_status: status,
      });
      if (error) console.error("reviewSubmission failed:", error.message);
      await refreshAll();
    },
    [refreshAll]
  );

  // --- Admin: course/topic tree management (direct table writes, RLS admin-gated) ---
  const addCourse = useCallback(
    async (course) => {
      const { error } = await supabase.from("courses").insert({
        id: course.id,
        title: course.title,
        description: course.description,
        icon: course.icon,
        difficulty: course.difficulty,
        topics: course.topics || [],
        project_id: course.projectId ?? null,
      });
      if (error) console.error("addCourse failed:", error.message);
      await refreshAll();
    },
    [refreshAll]
  );

  const updateCourse = useCallback(
    async (courseId, patch) => {
      const dbPatch = {};
      if ("title" in patch) dbPatch.title = patch.title;
      if ("description" in patch) dbPatch.description = patch.description;
      if ("icon" in patch) dbPatch.icon = patch.icon;
      if ("difficulty" in patch) dbPatch.difficulty = patch.difficulty;
      if ("topics" in patch) dbPatch.topics = patch.topics;
      if ("projectId" in patch) dbPatch.project_id = patch.projectId;

      const { error } = await supabase.from("courses").update(dbPatch).eq("id", courseId);
      if (error) console.error("updateCourse failed:", error.message);
      await refreshAll();
    },
    [refreshAll]
  );

  const deleteCourse = useCallback(
    async (courseId) => {
      const { error } = await supabase.from("courses").delete().eq("id", courseId);
      if (error) console.error("deleteCourse failed:", error.message);
      await refreshAll();
    },
    [refreshAll]
  );

  const setCourseTopics = useCallback(
    async (courseId, topics) => {
      const { error } = await supabase.from("courses").update({ topics }).eq("id", courseId);
      if (error) console.error("setCourseTopics failed:", error.message);
      await refreshAll();
    },
    [refreshAll]
  );

  // --- Admin: projects ---
  const addProject = useCallback(
    async (project) => {
      const { error } = await supabase.from("projects").insert({
        id: project.id,
        course_id: project.courseId,
        title: project.title,
        description: project.description,
        requirements: project.requirements || [],
        xp_reward: project.xpReward,
        difficulty: project.difficulty,
      });
      if (error) console.error("addProject failed:", error.message);
      await refreshAll();
    },
    [refreshAll]
  );

  const updateProject = useCallback(
    async (projectId, patch) => {
      const dbPatch = {};
      if ("title" in patch) dbPatch.title = patch.title;
      if ("description" in patch) dbPatch.description = patch.description;
      if ("courseId" in patch) dbPatch.course_id = patch.courseId;
      if ("requirements" in patch) dbPatch.requirements = patch.requirements;
      if ("xpReward" in patch) dbPatch.xp_reward = patch.xpReward;
      if ("difficulty" in patch) dbPatch.difficulty = patch.difficulty;

      const { error } = await supabase.from("projects").update(dbPatch).eq("id", projectId);
      if (error) console.error("updateProject failed:", error.message);
      await refreshAll();
    },
    [refreshAll]
  );

  const deleteProject = useCallback(
    async (projectId) => {
      const { error } = await supabase.from("projects").delete().eq("id", projectId);
      if (error) console.error("deleteProject failed:", error.message);
      await refreshAll();
    },
    [refreshAll]
  );

  // --- Admin: users (privileged operations run in the admin-users Edge Function) ---
  const callAdminUsers = useCallback(async (action, payload) => {
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action, ...payload },
    });
    if (error) throw new Error(error.message || "Admin action failed");
    if (data?.error) throw new Error(data.error);
    return data;
  }, []);

  const addUser = useCallback(
    async (user) => {
      try {
        await callAdminUsers("create", {
          username: user.username,
          password: user.password,
          displayName: user.displayName,
        });
        await refreshAll();
      } catch (err) {
        console.error("addUser failed:", err.message);
        alert(`Could not create member: ${err.message}`);
      }
    },
    [callAdminUsers, refreshAll]
  );

  const resetPassword = useCallback(
    async (userId, newPassword) => {
      try {
        await callAdminUsers("reset_password", { userId, newPassword });
      } catch (err) {
        console.error("resetPassword failed:", err.message);
        alert(`Could not reset password: ${err.message}`);
      }
    },
    [callAdminUsers]
  );

  const deleteUser = useCallback(
    async (userId) => {
      try {
        await callAdminUsers("delete", { userId });
        await refreshAll();
      } catch (err) {
        console.error("deleteUser failed:", err.message);
        alert(`Could not delete member: ${err.message}`);
      }
    },
    [callAdminUsers, refreshAll]
  );

  const value = {
    users,
    courses,
    projects,
    currentUser,
    ready,
    login,
    logout,
    changePassword,
    completeSubtopic,
    uncompleteSubtopic,
    submitProject,
    reviewSubmission,
    addCourse,
    updateCourse,
    deleteCourse,
    setCourseTopics,
    addProject,
    updateProject,
    deleteProject,
    addUser,
    resetPassword,
    deleteUser,
    levelUpEvent,
    dismissLevelUp,
    badgeQueue,
    dismissBadge,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
