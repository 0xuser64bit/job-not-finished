import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { appUrl, env } from "@/lib/env";

const DAY = 60 * 60 * 24;

export const auth = betterAuth({
  appName: "Job Not Finished",
  baseURL: appUrl,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      // Default scopes only (read:user, user:email). Public repos need nothing
      // more, and we never ask for write or private-repo access.
      overrideUserInfoOnSignIn: true,
      // Accounts with no email at all still get in; the digest skips
      // noreply addresses until the user adds a real one in settings.
      mapProfileToUser: (profile) => ({
        email: profile.email || `${profile.id}+${profile.login}@users.noreply.github.com`,
      }),
    },
  },
  account: {
    encryptOAuthTokens: true,
    // GitHub is the only identity. Another GitHub account that happens to
    // share an email must never inherit an existing user.
    accountLinking: { enabled: false },
  },
  session: {
    expiresIn: 30 * DAY,
    updateAge: DAY,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  onAPIError: { errorURL: `${appUrl}/sign-in` },
  // Every flow runs server-side through auth.api, so the HTTP surface is just
  // the OAuth callback. In particular /get-access-token must never be public.
  disabledPaths: [
    "/account-info",
    "/change-email",
    "/change-password",
    "/delete-user",
    "/delete-user/callback",
    "/get-access-token",
    "/link-social",
    "/list-accounts",
    "/list-sessions",
    "/refresh-token",
    "/request-password-reset",
    "/reset-password",
    "/revoke-other-sessions",
    "/revoke-session",
    "/revoke-sessions",
    "/send-verification-email",
    "/sign-in/email",
    "/sign-in/social",
    "/sign-up/email",
    "/unlink-account",
    "/update-session",
    "/update-user",
    "/verify-email",
    "/verify-password",
  ],
  plugins: [nextCookies()], // must stay last
});
