import "server-only";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  diffRepos,
  fetchOwnedPublicRepos,
  fetchViewer,
  GitHubError,
  mirroredSelect,
} from "@/lib/github";
import { claimLegacy } from "@/lib/legacy";

/** Manual syncs closer together than this are skipped. */
export const SYNC_COOLDOWN_MS = 60_000;

async function githubToken(userId: string) {
  const account = await db.account.findFirst({
    where: { userId, providerId: "github" },
    select: { id: true },
  });
  if (!account) throw new GitHubError("No GitHub account linked", 401);
  // Decrypts the stored token; only ever called server-side.
  const { accessToken } = await auth.api.getAccessToken({ body: { accountId: account.id, userId } });
  if (!accessToken) throw new GitHubError("No GitHub token stored", 401);
  return accessToken;
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
    db.user.update({ where: { id: userId }, data: { githubLogin: viewer.login, syncedAt: new Date() } }),
    db.project.createMany({ data: create.map((r) => ({ ...r, userId })), skipDuplicates: true }),
    ...update.map(({ id, data }) => db.project.update({ where: { id }, data })),
    db.project.deleteMany({ where: { id: { in: remove } } }),
  ]);
  await claimLegacy(userId, viewer.login);

  return { repos: repos.length, added: create.length, removed: remove.length };
}
