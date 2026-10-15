import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

type Purpose = "unsubscribe";

const mac = (purpose: Purpose, subject: string) =>
  createHmac("sha256", env.BETTER_AUTH_SECRET).update(`${purpose}:${subject}`).digest("base64url");

/**
 * Stateless signature for links that must keep working from old emails.
 * Rotating BETTER_AUTH_SECRET invalidates every one of them.
 */
export const sign = (purpose: Purpose, subject: string) => mac(purpose, subject);

export function verify(purpose: Purpose, subject: string, signature: string) {
  const expected = Buffer.from(mac(purpose, subject));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** A single-use secret for a link, plus the hash we store instead of it. */
export function oneTimeToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export const hashToken = (token: string) => createHash("sha256").update(token).digest("base64url");
