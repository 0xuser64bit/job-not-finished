import type { ProjectStatus } from "@/lib/generated/prisma/enums";

/** Default loan period when a project is checked out. */
export const LOAN_DAYS = 30;
/** Each renewal pushes the due date this far past today. */
export const RENEW_DAYS = 14;
/** No push for this long and a repo counts as dormant. */
export const DORMANT_DAYS = 90;

const DAY_MS = 86_400_000;

export const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS);

const stampFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

/** "OCT 15 2026", the way a library date stamp prints it. */
export const stampDate = (d: Date) => stampFormat.format(d).replace(",", "").toUpperCase();

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "just now", "3 minutes ago", "yesterday". */
export function ago(then: Date, now: Date) {
  const seconds = Math.round((then.getTime() - now.getTime()) / 1000);
  if (seconds > -45) return "just now";
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const [unit, size] = units.find(([, size]) => Math.abs(seconds) >= size) ?? units[2];
  return relative.format(Math.round(seconds / size), unit);
}

/** Whole days from `then` to `now`; null when there is no date. Never negative. */
export function daysSince(then: Date | null, now: Date): number | null {
  if (!then) return null;
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / DAY_MS));
}

/** Where a project sits at the circulation desk. */
export type Standing = "shelf" | "on-loan" | "overdue" | "returned" | "withdrawn";

export function standing(p: { status: ProjectStatus; dueAt: Date | null }, now: Date): Standing {
  switch (p.status) {
    case "IDLE":
      return "shelf";
    case "SHIPPED":
      return "returned";
    case "BURIED":
      return "withdrawn";
    case "ACTIVE":
      return p.dueAt && p.dueAt.getTime() < now.getTime() ? "overdue" : "on-loan";
  }
}

/** Days past the due date (0 when not overdue). */
export function daysOverdue(p: { status: ProjectStatus; dueAt: Date | null }, now: Date) {
  return standing(p, now) === "overdue" ? (daysSince(p.dueAt, now) ?? 0) : 0;
}

type Countable = {
  status: ProjectStatus;
  dueAt: Date | null;
  pushedAt: Date | null;
  repoCreatedAt: Date;
  isFork: boolean;
};

export type Tally = {
  /** Own repos, plus any fork you checked out, returned, or withdrew. */
  repos: number;
  shelf: number;
  onLoan: number;
  overdue: number;
  returned: number;
  withdrawn: number;
  /** Neither returned nor withdrawn. */
  unfinished: number;
  /** Unfinished and untouched for DORMANT_DAYS or more. */
  dormant: number;
};

export function tally(projects: Countable[], now: Date): Tally {
  const t: Tally = {
    repos: 0,
    shelf: 0,
    onLoan: 0,
    overdue: 0,
    returned: 0,
    withdrawn: 0,
    unfinished: 0,
    dormant: 0,
  };
  for (const p of projects) {
    // Forks only count once you've engaged with one.
    if (p.isFork && p.status === "IDLE") continue;
    t.repos++;
    const s = standing(p, now);
    if (s === "shelf") t.shelf++;
    else if (s === "on-loan") t.onLoan++;
    else if (s === "overdue") t.overdue++;
    else if (s === "returned") t.returned++;
    else t.withdrawn++;
    if (s === "returned" || s === "withdrawn") continue;
    t.unfinished++;
    if ((daysSince(p.pushedAt ?? p.repoCreatedAt, now) ?? 0) >= DORMANT_DAYS) t.dormant++;
  }
  return t;
}
