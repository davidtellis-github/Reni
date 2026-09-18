import type { NextConfig } from "next";
const supa = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "*.supabase.co";
const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: supa, pathname: "/storage/v1/object/public/**" }] },
  experimental: { serverActions: { bodySizeLimit: "25mb" } },
};
export default nextConfig;
