import "server-only";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  /** Public origin, e.g. https://jobnotfinished.dev. Optional on Vercel. */
  APP_URL: z.url().optional(),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  /** Without it, emails are printed to the server log instead of sent. */
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Job Not Finished <notices@localhost>"),
  /** Bearer token the weekly digest cron must present. */
  CRON_SECRET: z.string().min(16).optional(),
});

function load() {
  // CI and Docker builds compile without real secrets.
  if (process.env.SKIP_ENV_VALIDATION) return process.env as unknown as z.infer<typeof schema>;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid environment variables (see .env.example):\n${issues.join("\n")}`);
  }
  return parsed.data;
}

export const env = load();

/** Canonical origin for links in emails, OG images, and auth callbacks. */
export const appUrl =
  env.APP_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
