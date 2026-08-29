/** Shared password helpers aligned with Company / onboarding forms */

export function generateStrongPassword(length = 14) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%^&*-_+=?";
  const all = upper + lower + digits + special;
  const pick = (chars) => chars[Math.floor(Math.random() * chars.length)];
  const required = [pick(upper), pick(lower), pick(digits), pick(special)];
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () => pick(all));
  const chars = [...required, ...rest];
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export function isStrongPassword(password) {
  if (!password || password.length < 12) return false;
  return /[A-Z]/.test(password)
    && /[a-z]/.test(password)
    && /[0-9]/.test(password)
    && /[^A-Za-z0-9]/.test(password);
}

export const PASSWORD_HELPER =
  "Min 12 characters with uppercase, lowercase, number, and special character";
