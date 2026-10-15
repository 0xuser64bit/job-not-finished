import "server-only";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { composeDigest } from "@/lib/email/digest";
import { sendBatch } from "@/lib/email/send";
import { appUrl } from "@/lib/env";
import { addDays } from "@/lib/projects";
import { syncUser } from "@/lib/sync";
import { unsubscribePageUrl, unsubscribePostUrl } from "@/lib/unsubscribe";

const PAGE = 50;
const SYNC_CONCURRENCY = 5;

/** GitHub's relay addresses don't receive mail. */
export const deliverable = (address: string) =>
  !address.toLowerCase().endsWith("@users.noreply.github.com");

/**
 * Sends this week's notices. Safe to run any number of times: a user is only
 * picked up again six days after their last notice, and each batch carries an
 * idempotency key so a crash between "sent" and "recorded" can't double-send.
 * Stops when `outOfTime()` says so and reports what's left for the next run.
 */
export async function runDigest(now: Date, outOfTime: () => boolean) {
  // Walk users in id order so each run visits everyone at most once, however
  // many fail; a growing NOT IN list would hit Postgres's parameter limit.
  let cursor = "";
  const totals = { sent: 0, failed: 0, skipped: 0 };
  const week = Math.floor(now.getTime() / (7 * 86_400_000));

  while (!outOfTime()) {
    const users = await db.user.findMany({
      where: {
        id: { gt: cursor },
        digestEnabled: true,
        OR: [{ lastDigestAt: null }, { lastDigestAt: { lt: addDays(now, -6) } }],
        projects: { some: { status: "ACTIVE" } },
      },
      select: { id: true, email: true, emailVerified: true, digestEmail: true, githubLogin: true },
      orderBy: { id: "asc" },
      take: PAGE,
    });
    if (!users.length) return { done: true, ...totals };
    cursor = users[users.length - 1].id;

    // Fresh facts make honest roasts. If GitHub is down, last week's facts still beat silence.
    for (let i = 0; i < users.length; i += SYNC_CONCURRENCY) {
      await Promise.all(
        users
          .slice(i, i + SYNC_CONCURRENCY)
          .map((u) =>
            syncUser(u.id).catch((err) =>
              console.warn(`[digest] sync failed for ${u.id}:`, err.message),
            ),
          ),
      );
    }

    const projects = await db.project.findMany({
      where: { userId: { in: users.map((u) => u.id) }, status: "ACTIVE" },
      select: {
        id: true,
        userId: true,
        name: true,
        htmlUrl: true,
        status: true,
        progress: true,
        pushedAt: true,
        dueAt: true,
        renewals: true,
        openIssues: true,
      },
    });

    const recipients: string[] = [];
    const skipped: string[] = [];
    const emails = users.flatMap((u) => {
      // A verified override wins; GitHub's address only counts if GitHub verified it.
      const to = u.digestEmail ?? (u.emailVerified ? u.email : null);
      const mine = projects.filter((p) => p.userId === u.id);
      if (!to || !deliverable(to) || !mine.length) {
        skipped.push(u.id);
        return [];
      }
      recipients.push(u.id);
      return composeDigest({
        to,
        login: u.githubLogin,
        projects: mine,
        now,
        appUrl,
        unsubscribe: { page: unsubscribePageUrl(u.id), oneClick: unsubscribePostUrl(u.id) },
      });
    });

    const key = createHash("sha256")
      .update(`${week}:${recipients.join(",")}`)
      .digest("hex");
    const failedIndexes = await sendBatch(emails, `digest-${key}`);
    const sent = recipients.filter((_, i) => !failedIndexes.has(i));
    totals.sent += sent.length;
    totals.failed += failedIndexes.size;
    totals.skipped += skipped.length;

    // Skipped users are marked too, so an undeliverable address isn't retried every run.
    await db.user.updateMany({
      where: { id: { in: [...sent, ...skipped] } },
      data: { lastDigestAt: now },
    });
  }
  return { done: false, ...totals };
}
