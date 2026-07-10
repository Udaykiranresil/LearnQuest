const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789#$%&@";

export function generatePassword(length = 10) {
  let out = "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    out += CHARS[array[i] % CHARS.length];
  }
  return out;
}

export function usernameFromName(displayName, existingUsernames = []) {
  const base = displayName
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .join(".")
    .replace(/[^a-z.]/g, "");
  let candidate = base;
  let n = 1;
  while (existingUsernames.includes(candidate)) {
    candidate = `${base}${n}`;
    n += 1;
  }
  return candidate;
}
