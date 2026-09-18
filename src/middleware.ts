import { NextResponse, type NextRequest } from "next/server";
import { adminToken, ADMIN_COOKIE } from "@/lib/token";

// Gates /admin/* behind the ADMIN_PASSWORD cookie. Open when the env var is unset (local dev only).
export async function middleware(req: NextRequest) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || req.nextUrl.pathname === "/admin/login") return NextResponse.next();
  if (req.cookies.get(ADMIN_COOKIE)?.value === (await adminToken(pw))) return NextResponse.next();
  return NextResponse.redirect(new URL("/admin/login", req.url));
}
export const config = { matcher: ["/admin/:path*"] };
