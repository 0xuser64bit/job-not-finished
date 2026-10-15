import "server-only";
import { db } from "@/lib/db";
import { addDays, LOAN_DAYS } from "@/lib/projects";

// Everything in this file exists to carry v1 users' progress into v2.
// Delete it, and the Legacy* models, once legacy_users is empty in production.

type LegacyRow = { progress: number; reminder: boolean | null; createdAt: Date; updatedAt: Date };

/** How a v1 project lands in the v2 lifecycle; null when there is nothing worth keeping. */
export function fromLegacy(row: LegacyRow, now: Date) {
  const progress = Math.min(100, Math.max(0, row.progress));
  if (progress === 100) return { status: "SHIPPED" as const, progress, shippedAt: row.updatedAt };
  if (row.reminder || progress > 0) {
    return {
      status: "ACTIVE" as const,
      progress,
      activatedAt: row.createdAt,
      dueAt: addDays(now, LOAN_DAYS),
    };
  }
  return null;
}

/** Moves a v1 user's rows onto their freshly synced projects, then deletes them. */
export async function claimLegacy(userId: string, githubLogin: string) {
  const legacy = await db.legacyUser.findFirst({
    // v1 keyed users by login, so a rename since then means the data stays unclaimed.
    where: { githubId: { equals: githubLogin, mode: "insensitive" } },
    include: { projects: true },
  });
  if (!legacy) return;

  const now = new Date();
  const moves = legacy.projects.flatMap((row) => {
    const data = fromLegacy(row, now);
    // v1 project ids are GitHub repo ids. Only touch rows nobody has changed in v2.
    return data
      ? [db.project.updateMany({ where: { userId, repoId: row.id, status: "IDLE" }, data })]
      : [];
  });
  await db.$transaction([
    ...moves,
    db.legacyProject.deleteMany({ where: { userId: legacy.githubId } }),
    db.legacyUser.delete({ where: { id: legacy.id } }),
  ]);
}
