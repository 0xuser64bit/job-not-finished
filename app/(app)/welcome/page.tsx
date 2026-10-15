import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutPicker, type Candidate } from "@/components/checkout-picker";
import { Stamp } from "@/components/stamp";
import { db } from "@/lib/db";
import { daysSince, stampDate, tally, type Tally } from "@/lib/projects";
import { roast } from "@/lib/roast";
import { requireUser } from "@/lib/session";
import { syncErrorMessage, syncUser } from "@/lib/sync";

export const metadata: Metadata = { title: "Your record" };

function summary(t: Tally) {
  if (!t.repos)
    return "No public repos yet. Start one, then come back and let us nag you about it.";
  const ratio = t.unfinished ? t.dormant / t.unfinished : 0;
  if (ratio > 0.6) return "That's not a backlog. That's an archive.";
  if (ratio > 0.3) return "A respectable pile. Let's thin it out.";
  return "Honestly? Not bad. Let's keep it that way.";
}

export default async function Welcome() {
  const user = await requireUser();
  if (user.onboardedAt) redirect("/dashboard");

  let syncError: string | null = null;
  if (!user.syncedAt) {
    try {
      await syncUser(user.id);
    } catch (err) {
      syncError = syncErrorMessage(err);
    }
  }

  const now = new Date();
  const projects = await db.project.findMany({ where: { userId: user.id } });
  const t = tally(projects, now);
  const idle = projects
    .filter((p) => p.status === "IDLE" && !p.isFork && !p.isArchived)
    .map((p) => ({ p, days: daysSince(p.pushedAt ?? p.repoCreatedAt, now) ?? 0 }));
  const longest = [...idle].sort((a, b) => b.days - a.days)[0];
  const candidates: Candidate[] = idle
    .sort((a, b) => a.days - b.days)
    .slice(0, 12)
    .map(({ p, days }) => ({
      id: p.id,
      name: p.name,
      language: p.language,
      description: p.description,
      lastPush: days === 0 ? "pushed today" : `last push ${days}d ago`,
      roast: roast(p, now),
    }));
  const carried = t.onLoan + t.overdue + t.returned;

  const rows: [string, string][] = [
    ["Public repositories", String(t.repos)],
    ["Unfinished", String(t.unfinished)],
    ["Untouched 90 days or more", String(t.dormant)],
    ...(longest
      ? [["Longest neglected", `${longest.p.name}, ${longest.days} days`] as [string, string]]
      : []),
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-16">
      <section
        aria-labelledby="record"
        className="stock mx-auto w-full max-w-[46rem] px-6 pt-8 pb-10 sm:px-10"
      >
        <h1
          id="record"
          className="typed text-[1.35rem] leading-8 font-bold tracking-[0.18em] sm:text-[1.6rem]"
        >
          REPORT ON BORROWER {user.githubLogin ? `@${user.githubLogin.toUpperCase()}` : ""}
        </h1>
        <p className="typed mt-1 text-[0.82rem] text-ink-muted">As of {stampDate(now)}</p>
        {syncError ? (
          <p role="alert" className="typed mt-6 font-bold text-red">
            {syncError}
          </p>
        ) : (
          <>
            <dl className="typed mt-6 border-y border-dashed border-ink/40 py-3 text-[0.95rem]">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-baseline gap-2 leading-9">
                  <dt className="shrink-0">{label}</dt>
                  <span aria-hidden className="flex-1 border-b-2 border-dotted border-ink/30" />
                  <dd className="max-w-[60%] truncate text-right font-bold tabular-nums">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-6">
              <p className="typed max-w-[24rem] text-[1rem] leading-7 italic">{summary(t)}</p>
              <Stamp
                ink={t.dormant ? "red" : "violet"}
                tilt={-8}
                animate
                delay={500}
                className="text-[1.9rem]"
              >
                {t.dormant ? "Overdue" : "In good standing"}
              </Stamp>
            </div>
          </>
        )}
      </section>

      <section aria-labelledby="pick" className="mx-auto w-full max-w-[46rem]">
        <h2
          id="pick"
          className="font-display text-[clamp(2.2rem,5vw,3.2rem)] leading-[0.95] font-extrabold text-on-cloth uppercase"
        >
          Check out what you&apos;ll actually finish.
        </h2>
        <p className="mt-4 text-lg text-on-cloth-muted">
          {carried
            ? `You already have ${carried} project${carried === 1 ? "" : "s"} carried over from before. Add more if you dare.`
            : "Pick a few. Each one gets 30 days. Three is plenty: libraries limit loans for a reason."}
        </p>
        <div className="mt-8">
          {candidates.length ? (
            <CheckoutPicker candidates={candidates} />
          ) : (
            <p className="text-on-cloth-muted">
              Nothing on your shelf to check out.{" "}
              <Link href="/dashboard" className="link-cloth">
                Go to your catalog
              </Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
