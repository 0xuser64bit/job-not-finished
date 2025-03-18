import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignInParams } from "./types";

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
    async jwt({ token, account, profile }) {
      // Persist the GitHub username to the token
      if (
        account &&
        account.provider === "github" &&
        profile &&
        typeof profile.login === "string"
      ) {
        token.githubUsername = profile.login;
      }
      return token;
    },
    async session({ session, token }) {
      // Add the GitHub username to the session
      if (token && typeof token.githubUsername === "string") {
        session.user = session.user || {};
        session.user.githubUsername = token.githubUsername;
      }
      return session;
    },
    async signIn({ user, account, profile }: SignInParams) {
      if (
        account?.provider === "github" &&
        profile &&
        typeof profile.login === "string"
      ) {
        // Create or update user record
        await prisma.user.upsert({
          where: { githubId: profile.login },
          update: { githubId: profile.login },
          create: {
            githubId: profile.login,
            email: null,
          },
        });
      }
      return true;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = nextUrl.pathname.startsWith("/dashboard");

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL("/signin", nextUrl.origin);
        redirectUrl.searchParams.set("callbackUrl", nextUrl.href);
        return NextResponse.redirect(redirectUrl);
      }

      return true;
    },
  },
});
