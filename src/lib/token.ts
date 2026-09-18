/** Edge- and Node-safe: derives the admin cookie value from ADMIN_PASSWORD. */
export async function adminToken(pw: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("kfa:" + pw));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
export const ADMIN_COOKIE = "kfa_admin";
