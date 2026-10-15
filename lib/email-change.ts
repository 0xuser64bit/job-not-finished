import "server-only";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { confirmEmail } from "@/lib/email/confirm";
import { sendEmail } from "@/lib/email/send";
import { appUrl } from "@/lib/env";
import { addDays } from "@/lib/projects";
import { hashToken, oneTimeToken } from "@/lib/tokens";

// One pending change per user, stored in Better Auth's verifications table as
// "<sha256(token)>:<email>". The token itself only ever exists in the email.
const identifier = (userId: string) => `digest-email:${userId}`;
const THROTTLE_MS = 60_000;

export async function pendingEmailChange(userId: string) {
  const row = await db.verification.findFirst({
    where: { identifier: identifier(userId), expiresAt: { gt: new Date() } },
  });
  return row ? row.value.slice(row.value.indexOf(":") + 1) : null;
}

/** Emails a confirmation link to `email`. False when asked again too soon. */
export async function startEmailChange(userId: string, email: string) {
  const id = identifier(userId);
  const recent = await db.verification.findFirst({
    where: { identifier: id, createdAt: { gt: new Date(Date.now() - THROTTLE_MS) } },
  });
  if (recent) return false;

  const { token, hash } = oneTimeToken();
  await db.$transaction([
    db.verification.deleteMany({ where: { identifier: id } }),
    db.verification.create({
      data: {
        id: randomUUID(),
        identifier: id,
        value: `${hash}:${email}`,
        expiresAt: addDays(new Date(), 1),
      },
    }),
  ]);
  await sendEmail(
    confirmEmail(email, `${appUrl}/verify-email?u=${encodeURIComponent(userId)}&token=${token}`),
  );
  return true;
}

/** Applies the change if the link is genuine and fresh. Single use. */
export async function confirmEmailChange(userId: string, token: string) {
  const row = await db.verification.findFirst({ where: { identifier: identifier(userId) } });
  if (!row || row.expiresAt < new Date() || !token) return false;

  const split = row.value.indexOf(":");
  const stored = Buffer.from(row.value.slice(0, split));
  const given = Buffer.from(hashToken(token));
  if (stored.length !== given.length || !timingSafeEqual(stored, given)) return false;

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { digestEmail: row.value.slice(split + 1), digestEnabled: true },
    }),
    db.verification.delete({ where: { id: row.id } }),
  ]);
  return true;
}
