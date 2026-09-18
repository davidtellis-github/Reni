import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/** Anonymous client: public reads only (RLS enforced). Safe on the client and server. */
export function publicClient() {
  return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
}

/** Service-role client: bypasses RLS. SERVER ONLY — never import from a client component. */
export function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Public URL for a storage path in the "images" bucket, or a local /public path as-is. */
export function imageUrl(path: string | undefined | null) {
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `${url}/storage/v1/object/public/images/${path}`;
}
