import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";

const secret = "x".repeat(44);
const base = {
  DATABASE_URL: "postgresql://u:p@db.example.com:5432/app",
  GITHUB_CLIENT_ID: "id",
  GITHUB_CLIENT_SECRET: "secret",
};

describe("parseEnv", () => {
  it("accepts a v1 deployment's variable names unchanged", () => {
    // What the hosted project had configured before the v2 upgrade.
    const env = parseEnv({
      ...base,
      NODE_ENV: "production",
      NEXTAUTH_SECRET: secret,
      NEXTAUTH_URL: "https://job-not-finished.vercel.app",
      RESEND_API_KEY: "re_test",
    });
    expect(env.BETTER_AUTH_SECRET).toBe(secret);
    expect(env.APP_URL).toBe("https://job-not-finished.vercel.app");
  });

  it("prefers the v2 names over the v1 ones", () => {
    const env = parseEnv({
      ...base,
      BETTER_AUTH_SECRET: secret,
      NEXTAUTH_SECRET: "y".repeat(44),
      APP_URL: "https://new.example",
      NEXTAUTH_URL: "https://old.example",
    });
    expect(env.BETTER_AUTH_SECRET).toBe(secret);
    expect(env.APP_URL).toBe("https://new.example");
  });

  it("explains a missing or short secret", () => {
    expect(() => parseEnv(base)).toThrow(
      /Set BETTER_AUTH_SECRET \(v1's NEXTAUTH_SECRET also works\)/,
    );
    expect(() => parseEnv({ ...base, AUTH_SECRET: "short" })).toThrow(/at least 32 characters/);
  });

  it("requires a public origin in production unless Vercel supplies one", () => {
    const prod = { ...base, NODE_ENV: "production", BETTER_AUTH_SECRET: secret };
    expect(() => parseEnv(prod)).toThrow(/APP_URL is required in production/);
    expect(() =>
      parseEnv({ ...prod, VERCEL_PROJECT_PRODUCTION_URL: "app.vercel.app" }),
    ).not.toThrow();
  });
});

describe("withLibpqSsl", () => {
  it("keeps libpq's meaning of sslmode, and leaves other URLs alone", async () => {
    const { withLibpqSsl } = await import("@/lib/db");
    expect(withLibpqSsl("postgresql://u:p@db.example.com:5432/app?sslmode=require")).toBe(
      "postgresql://u:p@db.example.com:5432/app?sslmode=require&uselibpqcompat=true",
    );
    expect(withLibpqSsl("postgresql://u:p@h:6543/app?pgbouncer=true&sslmode=require")).toMatch(
      /&uselibpqcompat=true$/,
    );
    const untouched = [
      "postgresql://u:p@localhost:5432/app",
      "postgresql://u:p@h:6543/app?pgbouncer=true",
      "postgresql://u:p@h/app?sslmode=require&uselibpqcompat=true",
    ];
    for (const url of untouched) expect(withLibpqSsl(url)).toBe(url);
  });
});
