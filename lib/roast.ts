import type { ProjectStatus } from "@/lib/generated/prisma/enums";
import { daysOverdue, daysSince } from "@/lib/projects";

export type RoastInput = {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  pushedAt: Date | null;
  dueAt: Date | null;
  renewals: number;
  openIssues: number;
};

type Ctx = {
  name: string;
  /** "today", "1 day", "41 days" */
  ago: string;
  days: number;
  overdue: number;
  progress: number;
  renewals: number;
  issues: number;
  years: number;
};

type Line = (c: Ctx) => string;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Sting the project, never the person. Lines marked v1 are carried over from
// the original app's roasts.
const LINES = {
  returned: [
    (c) => `Returned. Job finished. The librarian stamped ${c.name} with something like pride.`,
    () => `Shipped. Frame this one.`,
    () => `Done and dusted. One less overdue notice in the world.`,
    (c) => `${c.name} is back on the shelf, finished. Now pick the next one.`,
  ],
  withdrawn: [
    () => `Withdrawn from circulation. Honest endings count too.`,
    () => `Laid to rest. It taught you something, which is more than most meetings do.`,
    () => `Withdrawn. Better a clean burial than a haunting.`,
  ],
  renewed: [
    (c) => `Renewed ${plural(c.renewals, "time")}. At this point it's not a loan, it's a lifestyle.`,
    (c) => `${plural(c.renewals, "renewal")}. The library is starting to talk.`,
  ],
  overdue: [
    (c) => `${plural(c.overdue, "day")} overdue. You set this deadline yourself, by the way.`,
    (c) => `Past due by ${plural(c.overdue, "day")}. Late fees are payable in shame.`,
    (c) => `${c.name} was due ${plural(c.overdue, "day")} ago. A strongly worded letter is being drafted.`,
    (c) => `Overdue by ${plural(c.overdue, "day")}. Renew it, return it, or withdraw it. Silence isn't an option.`,
  ],
  almost: [
    (c) => `${c.progress}% done. The last 10% is the other 90%. Finish it.`,
    (c) => `${c.progress}%. You can see the finish line. Stop looking at it and run.`,
    (c) => `So close it hurts. ${c.progress}% is one focused weekend, not one more month.`,
  ],
  bugs: [
    // v1
    (c) => `${c.issues} open issues and no commits in ${c.ago}. You're collecting bugs like trading cards.`,
  ],
  never: [
    () => `Created, never pushed. A library card with no books on it.`,
    () => `An empty repo with big dreams. Push one commit. Just one.`,
  ],
  fresh: [
    (c) => `Pushed ${c.ago === "today" ? "today" : `${c.ago} ago`}. Returning books on time? Who are you?`,
    (c) => `Fresh commits on ${c.name}. The librarian is suspicious but impressed.`,
    () => `You're on a roll. Don't let this become next month's overdue notice.`,
    // v1
    () => `You're on a roll! Don't stop now.`,
  ],
  warm: [
    // v1
    () => `Coffee's getting cold. Time to wake up and code.`,
    (c) => `${c.ago} quiet. Not overdue yet, but the librarian is watching the clock.`,
    (c) => `${c.ago} off. This is how it starts: a week off, a shiny new idea, a graveyard.`,
  ],
  stalling: [
    // v1
    (c) => `${c.ago} without a commit. Even house plants get more attention.`,
    // v1
    () => `Another day, another excuse not to finish this project.`,
    (c) => `${c.ago}. The bookmark hasn't moved, and neither have you.`,
    (c) => `${c.name} has been quiet for ${c.ago}. Shiny new idea, was it?`,
  ],
  cold: [
    // v1
    (c) => `${c.ago} since your last push. Even dinosaurs moved faster than this.`,
    // v1
    () => `This project is aging like milk, not wine. Time to revive it.`,
    (c) => `${c.ago} untouched. The dust jacket has dust.`,
    (c) => `${c.ago} of silence. At this point the bugs are maintaining it.`,
  ],
  fossil: [
    // v1
    () => `This project is collecting more dust than your gym membership card.`,
    // v1
    (c) => `${c.ago} without a commit. Is this a project or a digital fossil?`,
    (c) => `Last touched ${c.ago} ago. Archaeologists have been notified.`,
    (c) => `${c.ago}. Return it or admit it's lost.`,
  ],
  ancient: [
    (c) => `Over ${plural(c.years, "year")} without a push. This isn't overdue, it's a historical artifact.`,
    () => `Untouched for over a year. The framework you picked has been deprecated twice since.`,
    (c) => `${c.name} predates several of your current hobbies. Return it or withdraw it.`,
  ],
} satisfies Record<string, Line[]>;

export type RoastBucket = keyof typeof LINES;

export function bucket(p: RoastInput, now: Date): RoastBucket {
  if (p.status === "SHIPPED") return "returned";
  if (p.status === "BURIED") return "withdrawn";
  const active = p.status === "ACTIVE";
  if (active && p.renewals >= 3) return "renewed";
  if (active && daysOverdue(p, now) > 0) return "overdue";
  if (active && p.progress >= 85) return "almost";

  const days = daysSince(p.pushedAt, now);
  if (days === null) return "never";
  if (days >= 30 && p.openIssues >= 10) return "bugs";
  if (days <= 3) return "fresh";
  if (days <= 14) return "warm";
  if (days <= 30) return "stalling";
  if (days <= 90) return "cold";
  if (days <= 365) return "fossil";
  return "ancient";
}

/** FNV-1a; good enough to spread a seed across a handful of lines. */
function hash(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

/** Weeks since the Unix epoch, so the line changes weekly and stays put in between. */
const weekOf = (now: Date) => Math.floor(now.getTime() / (7 * 86_400_000));

export function roast(p: RoastInput, now = new Date()): string {
  const days = daysSince(p.pushedAt, now) ?? 0;
  const ctx: Ctx = {
    name: p.name,
    ago: days === 0 ? "today" : plural(days, "day"),
    days,
    overdue: daysOverdue(p, now),
    progress: p.progress,
    renewals: p.renewals,
    issues: p.openIssues,
    years: Math.floor(days / 365),
  };
  const lines: Line[] = LINES[bucket(p, now)];
  return lines[hash(`${p.id}:${weekOf(now)}`) % lines.length](ctx);
}
