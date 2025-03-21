"use server";

import { NextResponse } from "next/server";
import { getUser } from "./app/actions/get-user";
import { auth } from "./auth";
import { NextRequest } from "next/server";

// Secret key for cron job access
const CRON_SECRET = process.env.CRON_SECRET;

// Create a standalone function to check if this is a cron job request
function isCronRequest(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  const secret = request.nextUrl.searchParams.get("secret");
  const authHeader = request.headers.get("authorization");

  // Check if this is the cron endpoint with valid secret (either in query or header)
  const isValidCronEndpoint =
    pathname === "/api/reminder/sendEmail" &&
    (secret === CRON_SECRET || authHeader === `Bearer ${CRON_SECRET}`);

  return isValidCronEndpoint;
}

// Middleware handler that gets wrapped by NextAuth
export default auth(async (req) => {
  // First check if this is a cron request BEFORE any other logic
  if (isCronRequest(req)) {
    console.log(
      "[Middleware Debug] Valid cron job request detected - bypassing auth",
    );
    const response = NextResponse.next();
    response.headers.set("x-middleware-cache", "no-cache");
    return response;
  }

  // If not a cron request, proceed with regular auth flow
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
      const user = await getUser({ username: req.auth.user.githubUsername });
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

// This ensures the middleware is called for all routes except our cron job endpoints
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/reminder/sendEmail).*)",
    "/dashboard/:path*",
    "/collect-email",
  ],
};
