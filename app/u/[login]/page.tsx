import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { GitHubMark } from "@/components/github-mark";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Stamp } from "@/components/stamp";
import { signIn } from "@/lib/auth-actions";
import { db } from "@/lib/db";
import { daysOverdue, daysSince, stampDate, standing, tally } from "@/lib/projects";

type Params = { params: Promise<{ login: string }> };

const record = cache(async (login: string) =>
  db.user.findFirst({
    where: { githubLogin: { equals: login, mode: "insensitive" }, publicProfile: true },
    select: {
      githubLogin: true,
      name: true,
      image: true,
      createdAt: true,
      projects: {
        select: {
          id: true,
          name: true,
          htmlUrl: true,
          status: true,
          progress: true,
          dueAt: true,
          pushedAt: true,
          repoCreatedAt: true,
          shippedAt: true,
          buriedAt: true,
          epitaph: true,
          isFork: true,
        },
      },
    },
  }),
);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const user = await record((await params).login);
  if (!user) return { title: "Not in the catalog", robots: { index: false } };
  const t = tally(user.projects, new Date());
  return {
    title: `@${user.githubLogin}'s record`,
    description: `${t.onLoan + t.overdue} on loan, ${t.overdue} overdue, ${t.returned} returned, ${t.withdrawn} withdrawn.`,
  };
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[1.9rem] leading-none font-extrabold tracking-[0.03em] text-on-cloth uppercase">
      {children}
    </h2>
  );
}

export default async function PublicRecord({ params }: Params) {
  const user = await record((await params).login);
  if (!user) notFound();

  const now = new Date();
  const t = tally(user.projects, now);
  const loans = user.projects
    .filter((p) => p.status === "ACTIVE")
    .sort((a, b) => daysOverdue(b, now) - daysOverdue(a, now));
  const returned = user.projects
    .filter((p) => p.status === "SHIPPED")
    .sort((a, b) => (b.shippedAt?.getTime() ?? 0) - (a.shippedAt?.getTime() ?? 0));
  const withdrawn = user.projects.filter((p) => p.status === "BURIED");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-14 px-4 pt-6 pb-28 sm:px-6">
        <section className="stock grid gap-8 px-6 py-7 sm:px-9 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="flex items-start gap-5">
            {user.image && (
              <Image
                src={user.image}
                alt=""
                width={96}
                height={96}
                className="size-24 shrink-0 rounded-[2px] border-4 border-card mix-blend-multiply shadow-[0_0_0_1px_rgb(0_0_0/0.25)] contrast-110 grayscale"
              />
            )}
            <div className="min-w-0">
              <h1 className="typed text-[1.8rem] leading-9 font-bold break-words">
                @{user.githubLogin}
              </h1>
              <p className="typed mt-1 text-[0.85rem] text-ink-muted">
                {t.onLoan + t.overdue} on loan · {t.overdue} overdue · {t.returned} returned ·{" "}
                {t.withdrawn} withdrawn · card issued {stampDate(user.createdAt)}
              </p>
            </div>
          </div>
          <Stamp
            ink={t.overdue ? "red" : "violet"}
            tilt={-6}
            className="justify-self-start text-[1.8rem]"
          >
            {t.overdue ? `${t.overdue} overdue` : "In good standing"}
          </Stamp>
        </section>

        <section className="grid gap-6">
          <Heading>On loan</Heading>
          {loans.length ? (
            <ul className="stock divide-y divide-dashed divide-ink/25 px-5 sm:px-8">
              {loans.map((p) => {
                const s = standing(p, now);
                const pushed = daysSince(p.pushedAt ?? p.repoCreatedAt, now);
                return (
                  <li
                    key={p.id}
                    className="grid gap-x-6 gap-y-2 py-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-center"
                  >
                    <a
                      href={p.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="typed font-bold break-words hover:underline"
                    >
                      {p.name}
                    </a>
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="h-[5px] flex-1 rounded-[1px] bg-ink/15 [background-image:linear-gradient(var(--color-ink),var(--color-ink))] bg-no-repeat"
                        style={{ backgroundSize: `${p.progress}% 100%` }}
                      />
                      <span className="typed w-11 text-right text-sm font-bold tabular-nums">
                        {p.progress}%
                      </span>
                    </span>
                    <span className="typed text-[0.8rem] text-ink-muted sm:text-right">
                      {s === "overdue" ? (
                        <Stamp ink="red" bare tilt={-2} className="text-[1.05rem]">
                          {daysOverdue(p, now)}d overdue
                        </Stamp>
                      ) : (
                        `last push ${pushed}d ago`
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-on-cloth-muted">Nothing checked out right now.</p>
          )}
        </section>

        {(returned.length > 0 || withdrawn.length > 0) && (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-14 md:grid-cols-2 md:gap-8">
            <section className="grid content-start gap-6">
              <Heading>Returned</Heading>
              {returned.length ? (
                <ul className="stock divide-y divide-dashed divide-ink/25 px-5 sm:px-7">
                  {returned.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                    >
                      <a
                        href={p.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="typed font-bold break-words hover:underline"
                      >
                        {p.name}
                      </a>
                      {p.shippedAt && (
                        <Stamp ink="green" bare tilt={-2} className="text-[1.05rem]">
                          {stampDate(p.shippedAt)}
                        </Stamp>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-on-cloth-muted">Nothing returned yet.</p>
              )}
            </section>
            <section className="grid content-start gap-6">
              <Heading>Withdrawn</Heading>
              {withdrawn.length ? (
                <ul className="stock divide-y divide-dashed divide-ink/25 px-5 sm:px-7">
                  {withdrawn.map((p) => (
                    <li key={p.id} className="py-3.5">
                      <span className="typed font-bold break-words">{p.name}</span>
                      {p.epitaph && (
                        <p className="typed mt-1 text-[0.88rem] italic">“{p.epitaph}”</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-on-cloth-muted">Nothing withdrawn.</p>
              )}
            </section>
          </div>
        )}

        <section className="stock stock-manila flex flex-col items-start gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-9">
          <p className="typed max-w-[30rem] leading-7">
            Every developer has a pile like this. Find out how overdue yours is.
          </p>
          <form action={signIn}>
            <button type="submit" className="btn btn-card">
              <GitHubMark className="size-5" />
              Check your record
            </button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
