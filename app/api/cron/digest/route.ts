import { timingSafeEqual } from "node:crypto";
import { runDigest } from "@/lib/digest";
import { emailMisconfigured } from "@/lib/email/send";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
// Vercel caps this per plan; the run stops early and reports `done: false`.
export const maxDuration = 300;

const BUDGET_MS = 240_000;

function authorized(request: Request) {
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${env.CRON_SECRET}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Weekly notices. Vercel Cron calls it with `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
  if (!env.CRON_SECRET) {
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  }
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  // Fail before touching anyone's record, so the next run starts clean.
  if (emailMisconfigured) return Response.json({ error: emailMisconfigured }, { status: 503 });

  const started = Date.now();
  const result = await runDigest(new Date(), () => Date.now() - started > BUDGET_MS);
  console.info("[digest]", result);
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
