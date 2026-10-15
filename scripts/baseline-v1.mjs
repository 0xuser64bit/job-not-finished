// Restored v1 databases often arrive without Prisma's migration history: the
// "User" and "Project" tables exist, but nothing records the migrations that
// made them, so `prisma migrate deploy` tries to create them again and fails.
// When the v1 tables are present and not yet upgraded, record v1's migrations
// as applied so that only the v2 upgrade runs. If a deploy already tripped over
// such tables (P3018) and they have since been removed, the failed attempt
// stays on record and blocks every later deploy (P3009), so mark it rolled
// back and let v1's init run again. Safe to run on every deploy: a fresh or
// already-upgraded database is left alone. Every decision is logged (names
// only, never data) so a deploy log shows what it saw.
import "dotenv/config";
import { execFileSync } from "node:child_process";
import pg from "pg";

const V1_INIT = "20250318155718_init";
const V1_REMINDER = "20250319071651_add_reminder";
const log = (message) => console.log(`[baseline] ${message}`);

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

// Resolve names the way Postgres (and Prisma's CREATE TABLE) does: through the
// search path, regardless of which role owns the table.
const { rows } = await client.query(
  `select to_regclass('"User"')::text as "user",
          to_regclass('"Project"')::text as project,
          to_regclass('_prisma_migrations')::text as history`,
);
const found = rows[0];
const columns = async (table) =>
  (
    await client.query(
      `select attname as name from pg_attribute
        where attrelid = $1::regclass and attnum > 0 and not attisdropped`,
      [table],
    )
  ).rows.map((r) => r.name);

const history = found.history
  ? (
      await client.query(
        `select migration_name as name, finished_at is not null as finished,
                rolled_back_at is not null as "rolledBack"
           from _prisma_migrations`,
      )
    ).rows
  : [];
const state = (m) => (m.rolledBack ? "rolled back" : m.finished ? "applied" : "failed");
const applied = history.filter((m) => state(m) === "applied").map((m) => m.name);
const failed = history.filter((m) => state(m) === "failed").map((m) => m.name);
log(`history: ${history.map((m) => `${m.name} (${state(m)})`).join(", ") || "none"}`);
log(
  `v1 tables: "User" ${found.user ? "present" : "absent"}, "Project" ${found.project ? "present" : "absent"}`,
);

let toRecord = [];
let toRetry = [];
if (!found.user && !found.project) {
  // Neither table it creates exists, so running it again can't collide with a
  // restore. Anything else it left behind makes the rerun fail loudly (P3018).
  if (failed.includes(V1_INIT)) toRetry = [V1_INIT];
  else log("no v1 tables; nothing to baseline");
} else if (!found.user || !found.project) {
  log("only one v1 table exists, leaving it alone: restore the other or drop it");
} else {
  const userColumns = await columns('"User"');
  const projectColumns = await columns('"Project"');
  // Only call it v1 if it looks like v1, never someone else's "User" table.
  const isV1 =
    ["id", "email", "githubId"].every((c) => userColumns.includes(c)) &&
    ["id", "name", "progress", "userId"].every((c) => projectColumns.includes(c));
  if (!isV1) {
    log(
      `"User" and "Project" exist but don't match v1, leaving them alone. ` +
        `User: ${userColumns.join(", ")}. Project: ${projectColumns.join(", ")}.`,
    );
  } else {
    toRecord = [V1_INIT, ...(projectColumns.includes("reminder") ? [V1_REMINDER] : [])].filter(
      (m) => !applied.includes(m),
    );
    if (!toRecord.length) log("v1 tables found with their history recorded; nothing to baseline");
  }
}
await client.end();

for (const migration of toRetry) {
  log(`no v1 tables, but ${migration} is recorded as failed; marking it rolled back to rerun it`);
  execFileSync("prisma", ["migrate", "resolve", "--rolled-back", migration], { stdio: "inherit" });
}
for (const migration of toRecord) {
  log(`v1 tables found without history; recording ${migration} as applied`);
  // `resolve --applied` also clears an earlier failed attempt at the same migration.
  execFileSync("prisma", ["migrate", "resolve", "--applied", migration], { stdio: "inherit" });
}
