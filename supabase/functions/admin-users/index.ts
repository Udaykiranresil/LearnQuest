// Supabase Edge Function: admin-users
// Handles the three privileged operations the client can never do with the
// anon/authenticated key: creating an auth user, resetting a password, and
// deleting a user. Every request is verified server-side to come from an
// authenticated admin before anything runs.
//
// Deploy:  supabase functions deploy admin-users
// Secrets: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided
//          automatically by the Supabase platform for Edge Functions.

import { createClient } from "npm:@supabase/supabase-js@2";

const EMAIL_DOMAIN = "learnquest.internal";
const usernameToEmail = (u: string) => `${u.trim().toLowerCase()}@${EMAIL_DOMAIN}`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "Missing Authorization header" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Admin client: full privileges, used only after we've verified the caller.
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the caller's JWT and load their profile to confirm role = admin.
    const { data: userRes, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userRes?.user) return json({ error: "Invalid session" }, 401);

    const { data: callerProfile, error: profileErr } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userRes.user.id)
      .single();

    if (profileErr || callerProfile?.role !== "admin") {
      return json({ error: "Admin privileges required" }, 403);
    }

    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { username, password, displayName } = body;
      if (!username || !password || !displayName) {
        return json({ error: "username, password, and displayName are required" }, 400);
      }
      if (password.length < 8) {
        return json({ error: "Password must be at least 8 characters" }, 400);
      }

      const email = usernameToEmail(username);

      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username, display_name: displayName },
      });
      if (createErr) return json({ error: createErr.message }, 400);

      const { error: insertErr } = await admin.from("profiles").insert({
        id: created.user.id,
        username: username.trim().toLowerCase(),
        display_name: displayName.trim(),
        role: "user",
      });
      if (insertErr) {
        // Roll back the auth user so we don't leave an orphaned account.
        await admin.auth.admin.deleteUser(created.user.id);
        return json({ error: insertErr.message }, 400);
      }

      return json({ ok: true, userId: created.user.id });
    }

    if (action === "reset_password") {
      const { userId, newPassword } = body;
      if (!userId || !newPassword) return json({ error: "userId and newPassword are required" }, 400);
      if (newPassword.length < 8) return json({ error: "Password must be at least 8 characters" }, 400);

      const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "delete") {
      const { userId } = body;
      if (!userId) return json({ error: "userId is required" }, 400);
      if (userId === userRes.user.id) return json({ error: "You cannot delete your own account" }, 400);

      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true }); // profile row cascades via FK
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
