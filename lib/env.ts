import "server-only";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z
    .string({ error: "Set BETTER_AUTH_SECRET (v1's NEXTAUTH_SECRET also works)" })
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters (openssl rand -base64 32)"),
  /** Public origin, e.g. https://jobnotfinished.dev. Optional on Vercel. */
  APP_URL: z.url().optional(),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  /** Without it, emails are printed to the server log instead of sent. */
  RESEND_API_KEY: z.string().optional(),
  /** Sender on a domain verified in Resend. Required for sending, not for building. */
  EMAIL_FROM: z.string().optional(),
  /** Bearer token the weekly digest cron must present. */
  CRON_SECRET: z.string().min(16).optional(),
});

export type Env = z.infer<typeof schema>;

type Source = Record<string, string | undefined>;

/**
 * Validates configuration, accepting v1's variable names so an upgraded
 * deployment builds without renaming anything: NEXTAUTH_SECRET or AUTH_SECRET
 * for the secret, NEXTAUTH_URL for the origin.
 */
export function parseEnv(source: Source): Env {
  const parsed = schema.safeParse({
    ...source,
    BETTER_AUTH_SECRET: source.BETTER_AUTH_SECRET || source.AUTH_SECRET || source.NEXTAUTH_SECRET,
    APP_URL: source.APP_URL || source.NEXTAUTH_URL || undefined,
  });
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid environment variables (see .env.example):\n${issues.join("\n")}`);
  }
  // Falling back to localhost in production would silently break OAuth callbacks and email links.
  if (
    source.NODE_ENV === "production" &&
    !parsed.data.APP_URL &&
    !source.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    throw new Error("APP_URL is required in production, e.g. APP_URL=https://your-domain.com");
  }
  return parsed.data;
}

// CI and Docker builds compile without real secrets.
export const env = process.env.SKIP_ENV_VALIDATION
  ? (process.env as unknown as Env)
  : parseEnv(process.env);

/** Canonical origin for links in emails, OG images, and auth callbacks. */
export const appUrl =
  env.APP_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
