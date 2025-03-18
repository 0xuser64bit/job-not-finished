import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export default auth(async (req) => {
  // req.auth contains the user's session
  // This middleware is called for all routes
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Public routes accessible to all users
  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/signin" ||
    nextUrl.pathname.startsWith("/api/auth") || 
    nextUrl.pathname === "/collect-email";

  // If trying to access a protected route while not logged in
  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/signin", nextUrl.origin));
  }

  // If logged in, check if email is collected
  if (isLoggedIn && req.auth?.user?.githubUsername) {
    try {
      const user = await prisma.user.findUnique({
        where: { githubId: req.auth.user.githubUsername },
      });

      // If email is not collected and trying to access dashboard or other protected routes (not collect-email)
      if (!user?.email && nextUrl.pathname.startsWith("/dashboard")) {
        console.log("Redirecting to collect-email because email is not set");
        return NextResponse.redirect(new URL("/collect-email", nextUrl.origin));
      }

      // If email is collected and trying to access collect-email page
      if (user?.email && nextUrl.pathname === "/collect-email") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
      }
    } catch (error) {
      console.error("Error in middleware checking user email:", error);
      // Continue request in case of DB errors
    }
  }

  // If trying to access login page while already logged in
  if (nextUrl.pathname === "/signin" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

// This ensures the middleware is called for all routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/dashboard/:path*", 
    "/collect-email"
  ],
};
