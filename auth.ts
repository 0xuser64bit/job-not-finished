import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { NextResponse } from "next/server";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/dashboard");

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL("/signin", nextUrl.origin);
        redirectUrl.searchParams.set("callbackUrl", nextUrl.href);
        return NextResponse.redirect(redirectUrl);
      }

      return true;
    },
  },
});
