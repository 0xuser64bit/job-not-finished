import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Migrations need a direct (non-pooled) connection. Vercel's Neon integration
  // sets DATABASE_URL_UNPOOLED; elsewhere it's DIRECT_URL. Most self-hosted
  // setups only have one URL, so fall back to it.
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
