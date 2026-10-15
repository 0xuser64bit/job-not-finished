import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { env } from "@/lib/env";

/**
 * node-postgres reads sslmode=require (and prefer, verify-ca) as verify-full,
 * unlike libpq and v1's Prisma engine, which encrypt without checking the CA.
 * Hosts such as Supabase sign with their own CA, so keep the libpq meaning the
 * URL was written for. URLs without sslmode are left alone.
 */
export function withLibpqSsl(url: string) {
  if (!/[?&]sslmode=/i.test(url) || /[?&]uselibpqcompat=/i.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}uselibpqcompat=true`;
}

const create = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: withLibpqSsl(env.DATABASE_URL) }),
  });

// One client per server instance; dev hot reloads would otherwise leak pools.
const globalForDb = globalThis as unknown as { db?: ReturnType<typeof create> };
export const db = globalForDb.db ?? create();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;
