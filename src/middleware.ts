import { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Check if the request has a session token cookie
  const hasSessionTokenCookie =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");

  if (!hasSessionTokenCookie && req.nextUrl.pathname !== "/") {
    const loginUrl = new URL("/", req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!api|static|_next|favicon.png).*)"],
};
