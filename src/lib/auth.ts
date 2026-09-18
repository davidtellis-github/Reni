import { cookies } from "next/headers";
import { adminToken, ADMIN_COOKIE } from "./token";

/** True when ADMIN_PASSWORD is unset (local dev) or the cookie matches. */
export async function isAdmin() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return true;
  const c = await cookies();
  return c.get(ADMIN_COOKIE)?.value === (await adminToken(pw));
}
export async function setAdminCookie() {
  const c = await cookies();
  c.set(ADMIN_COOKIE, await adminToken(process.env.ADMIN_PASSWORD || ""), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
}
export async function clearAdminCookie() {
  const c = await cookies();
  c.delete(ADMIN_COOKIE);
}
