import "server-only";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  diffRepos,
  fetchOwnedPublicRepos,
  fetchViewer,
  GitHubError,
  mirroredSelect,
} from "@/lib/github";
import { claimLegacy } from "@/lib/legacy";

/** What to tell the user when a sync fails. */
export function syncErrorMessage(err: unknown) {
  if (err instanceof GitHubError && err.status === 401) {
    return "GitHub access was revoked. Sign out and back in to reconnect.";
  }
  if (err instanceof GitHubError && err.status === 429) {
    const minutes = Math.max(1, Math.ceil((err.retryAfter ?? 60) / 60));
    return `GitHub asked us to slow down. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
  }
  console.error("[sync]", err);
  return "Couldn't reach GitHub just now. Try again in a minute.";
}

/** Manual syncs closer together than this are skipped. */
export const SYNC_COOLDOWN_MS = 60_000;

async function githubToken(userId: string) {
  const account = await db.account.findFirst({
    where: { userId, providerId: "github" },
    select: { id: true },
  });
  if (!account) throw new GitHubError("No GitHub account linked", 401);
  // Decrypts the stored token; only ever called server-side.
  const { accessToken } = await auth.api.getAccessToken({
    body: { accountId: account.id, userId },
  });
  if (!accessToken) throw new GitHubError("No GitHub token stored", 401);
  return accessToken;
}

/**
 * Removes this app from the user's authorized OAuth apps on GitHub. Best
 * effort: account deletion goes ahead even if GitHub is unreachable.
 */
export async function revokeGitHubAccess(userId: string) {
  const token = await githubToken(userId);
  const credentials = Buffer.from(`${env.GITHUB_CLIENT_ID}:${env.GITHUB_CLIENT_SECRET}`).toString(
    "base64",
  );
  const res = await fetch(`https://api.github.com/applications/${env.GITHUB_CLIENT_ID}/grant`, {
    method: "DELETE",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Basic ${credentials}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ access_token: token }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok && res.status !== 404)
    throw new GitHubError(`Grant revocation failed (${res.status})`, res.status);
}

/** Mirrors the user's public repos into `projects`. All-or-nothing: a failed fetch writes nothing. */
export async function syncUser(userId: string) {
  const token = await githubToken(userId);
  const [viewer, repos] = await Promise.all([fetchViewer(token), fetchOwnedPublicRepos(token)]);
  const stored = await db.project.findMany({ where: { userId }, select: mirroredSelect });
  const { create, update, remove } = diffRepos(stored, repos);

  await db.$transaction([
    // Logins are unique on GitHub at any moment, so whoever still holds this one is stale.
    db.user.updateMany({
      where: { githubLogin: { equals: viewer.login, mode: "insensitive" }, NOT: { id: userId } },
      data: { githubLogin: null },
    }),
    db.user.update({
      where: { id: userId },
      data: { githubLogin: viewer.login, syncedAt: new Date() },
    }),
    db.project.createMany({ data: create.map((r) => ({ ...r, userId })), skipDuplicates: true }),
    ...update.map(({ id, data }) => db.project.update({ where: { id }, data })),
    db.project.deleteMany({ where: { id: { in: remove } } }),
  ]);
  await claimLegacy(userId, viewer.login);

  return { repos: repos.length, added: create.length, removed: remove.length };
}
