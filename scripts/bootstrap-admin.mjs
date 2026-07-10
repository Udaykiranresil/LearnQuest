// One-time setup script: creates the first admin account.
// After this, all further members should be created from the Admin ->
// Members screen in the app itself (which uses the admin-users Edge Function).
//
// Usage:
//   SUPABASE_URL=https://xxxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
//   node scripts/bootstrap-admin.mjs <username> <password> "<Display Name>"
//
// The service role key is found in Supabase Dashboard -> Project Settings ->
// API -> service_role. NEVER put this key in the frontend or commit it.

import { createClient } from "@supabase/supabase-js";

const [, , username, password, displayName] = process.argv;
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}
if (!username || !password || !displayName) {
  console.error('Usage: node scripts/bootstrap-admin.mjs <username> <password> "<Display Name>"');
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = `${username.trim().toLowerCase()}@learnquest.internal`;

const { data: created, error: createErr } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { username, display_name: displayName },
});

if (createErr) {
  console.error("Failed to create auth user:", createErr.message);
  process.exit(1);
}

const { error: insertErr } = await supabase.from("profiles").insert({
  id: created.user.id,
  username: username.trim().toLowerCase(),
  display_name: displayName.trim(),
  role: "admin",
});

if (insertErr) {
  console.error("Failed to create profile row:", insertErr.message);
  await supabase.auth.admin.deleteUser(created.user.id);
  process.exit(1);
}

console.log("Admin account created.");
console.log(`  Username: ${username}`);
console.log(`  Password: ${password}`);
console.log("Log in with these at /login.");




