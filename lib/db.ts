import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { env } from "@/lib/env";

const create = () =>
  new PrismaClient({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) });

// One client per server instance; dev hot reloads would otherwise leak pools.
const globalForDb = globalThis as unknown as { db?: ReturnType<typeof create> };
export const db = globalForDb.db ?? create();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;
