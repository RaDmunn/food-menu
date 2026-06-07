import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/admin", "/user", "/menu"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/menu/:path*"],
};
