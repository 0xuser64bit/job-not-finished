// Restored v1 databases often arrive without Prisma's migration history: the
// "User" and "Project" tables exist, but nothing records the migrations that
// made them, so `prisma migrate deploy` tries to create them again and fails.
// When the v1 tables are present and not yet upgraded, record v1's migrations
// as applied so that only the v2 upgrade runs. Safe to run on every deploy:
// a fresh or already-upgraded database is left alone.
import "dotenv/config";
import { execFileSync } from "node:child_process";
import pg from "pg";

const V1_INIT = "20250318155718_init";
const V1_REMINDER = "20250319071651_add_reminder";

// Same precedence as prisma.config.ts.
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) process.exit(0);

// Keep libpq's meaning of sslmode, as lib/db.ts does.
const connectionString =
  /[?&]sslmode=/i.test(url) && !/[?&]uselibpqcompat=/i.test(url)
    ? `${url}${url.includes("?") ? "&" : "?"}uselibpqcompat=true`
    : url;

const client = new pg.Client({ connectionString });
await client.connect();
const names = async (sql, params) => (await client.query(sql, params)).rows.map((r) => r.name);

const tables = await names(
  `select table_name as name from information_schema.tables
    where table_schema = current_schema() and table_name = any($1)`,
  [["User", "Project", "_prisma_migrations"]],
);
let toRecord = [];
if (tables.includes("User") && tables.includes("Project")) {
  const projectColumns = await names(
    `select column_name as name from information_schema.columns
      where table_schema = current_schema() and table_name = 'Project'`,
  );
  // Only call it v1 if it looks exactly like v1, never someone else's "User" table.
  const userColumns = await names(
    `select column_name as name from information_schema.columns
      where table_schema = current_schema() and table_name = 'User'`,
  );
  const isV1 =
    ["id", "email", "githubId"].every((c) => userColumns.includes(c)) &&
    ["id", "name", "progress", "userId"].every((c) => projectColumns.includes(c));
  if (isV1) {
    const applied = tables.includes("_prisma_migrations")
      ? await names(
          `select migration_name as name from _prisma_migrations
            where finished_at is not null and rolled_back_at is null`,
        )
      : [];
    toRecord = [V1_INIT, ...(projectColumns.includes("reminder") ? [V1_REMINDER] : [])].filter(
      (m) => !applied.includes(m),
    );
  }
}
await client.end();

for (const migration of toRecord) {
  console.log(`[baseline] v1 schema found without history; recording ${migration} as applied`);
  // `resolve --applied` also clears an earlier failed attempt at the same migration.
  execFileSync("prisma", ["migrate", "resolve", "--applied", migration], { stdio: "inherit" });
}
