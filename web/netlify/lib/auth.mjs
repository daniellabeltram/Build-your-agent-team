// Optional shared password. If ACCESS_PASSWORD is set in Netlify, every request must send it.
// Without it, anyone who finds the site URL can spend your API credits.
import { timingSafeEqual, createHash } from "node:crypto";

export const passwordRequired = () => Boolean(process.env.ACCESS_PASSWORD);

export function checkPassword(given) {
  const expected = process.env.ACCESS_PASSWORD;
  if (!expected) return true;
  const h = (s) => createHash("sha256").update(String(s ?? "")).digest();
  return timingSafeEqual(h(given), h(expected));
}
