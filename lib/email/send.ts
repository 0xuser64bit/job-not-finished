import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";

export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
};

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/** Why email can't go out, if it can't. Checked before any send. */
export const emailMisconfigured =
  resend && !env.EMAIL_FROM
    ? "EMAIL_FROM is not set: use an address on a domain verified in Resend"
    : null;

function sender() {
  if (emailMisconfigured) throw new Error(emailMisconfigured);
  return env.EMAIL_FROM!;
}

function logInstead(email: Email) {
  // Development without Resend: show what would have gone out.
  console.info(`[email] to=${email.to} subject="${email.subject}"\n${email.text}\n`);
}

export async function sendEmail(email: Email, idempotencyKey?: string) {
  if (!resend) return logInstead(email);
  const { error } = await resend.emails.send({ from: sender(), ...email }, { idempotencyKey });
  if (error) throw new Error(`Resend: ${error.message}`);
}

/**
 * Sends up to 100 emails in one request. Returns the indexes that failed, so
 * one bad address never sinks the rest of the batch.
 */
export async function sendBatch(emails: Email[], idempotencyKey?: string): Promise<Set<number>> {
  if (!emails.length) return new Set();
  if (!resend) {
    emails.forEach(logInstead);
    return new Set();
  }
  const from = sender();
  const { data, error } = await resend.batch.send(
    emails.map((e) => ({ from, ...e })),
    { idempotencyKey, batchValidation: "permissive" },
  );
  if (error) throw new Error(`Resend batch: ${error.message}`);
  return new Set(data.errors.map((e) => e.index));
}
