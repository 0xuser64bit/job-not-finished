import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  // req.auth contains the user's session
  // This middleware is called for all routes
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Public routes accessible to all users
  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/signin" ||
    nextUrl.pathname.startsWith("/api/auth");

  // If trying to access a protected route while not logged in
  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/signin", nextUrl.origin));
  }

  // If trying to access login page while already logged in
  if (nextUrl.pathname === "/signin" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

// This ensures the middleware is called for all routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
