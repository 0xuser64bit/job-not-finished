import Link from "next/link";
import type { CardProject } from "@/components/catalog-card";
import { DateDueSlip } from "@/components/date-due-slip";
import { DemoCard } from "@/components/demo-card";
import { GitHubMark } from "@/components/github-mark";
import { NoticeSheet } from "@/components/notice-sheet";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Stamp, type Ink } from "@/components/stamp";
import { signIn } from "@/lib/auth-actions";
import { demoProjects } from "@/lib/demo";
import { addDays } from "@/lib/projects";
import { REPO_URL } from "@/lib/site";

// Sample dates are relative to render time; refresh them daily.
export const revalidate = 86400;

const STAMPS: { label: string; ink: Ink; tilt: number; body: string }[] = [
  {
    label: "Checked out",
    ink: "violet",
    tilt: -4,
    body: "Pick the projects you will actually finish. Each one gets a due date, 30 days out unless you're feeling brave.",
  },
  {
    label: "Overdue",
    ink: "red",
    tilt: -8,
    body: "Miss the date and it goes overdue. Every Sunday a notice lands in your inbox, built from your real commit history.",
  },
  {
    label: "Renewed",
    ink: "violet",
    tilt: 3,
    body: "Need more time? Renew for two weeks. Every renewal is counted, and mentioned.",
  },
  {
    label: "Returned",
    ink: "green",
    tilt: -5,
    body: "Ship it and stamp it returned. Job finished.",
  },
  {
    label: "Withdrawn",
    ink: "black",
    tilt: 4,
    body: "Or let it go on purpose, with an epitaph. Honest endings count too.",
  },
];

const TERMS = [
  "We read your public repositories, your GitHub profile, and your email address. Nothing else.",
  "We can't see private repos and we can't write to GitHub. Sign-in asks for read:user and user:email, the narrowest scopes GitHub offers.",
  "We keep repo names, push dates, and the progress you report. Your GitHub token is encrypted at rest.",
  "One email a week, only about projects you checked out. One click stops it.",
  "Close your card whenever you like. Everything goes with it.",
  "Free, with no ads and no paid tier. Open source under MIT, so you can run your own desk.",
];

function CheckRecord({ className }: { className?: string }) {
  return (
    <form action={signIn} className={className}>
      <button type="submit" className="btn btn-card">
        <GitHubMark className="size-5" />
        Check your record
      </button>
    </form>
  );
}

function SectionHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="foil font-display text-[clamp(2.4rem,5vw,3.6rem)] leading-[0.95] font-extrabold tracking-[0.01em] text-on-cloth uppercase"
    >
      {children}
    </h2>
  );
}

export default function Home() {
  const now = new Date();
  const [sample] = demoProjects(now);
  const demo: CardProject = {
    ...sample,
    htmlUrl: null,
    isFork: false,
    isArchived: false,
    repoCreatedAt: addDays(now, -120),
    activatedAt: addDays(now, -40),
    shippedAt: null,
    buriedAt: null,
    epitaph: null,
  };

  return (
    <>
      <SiteHeader />

      <main>
        <section
          aria-labelledby="hero"
          className="mx-auto grid max-w-6xl items-center gap-x-14 gap-y-14 px-4 pt-8 pb-24 sm:px-6 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:pt-14"
        >
          <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <DateDueSlip now={now} />
          </div>
          <div className="order-1 lg:order-2">
            <h1
              id="hero"
              className="foil font-display text-[clamp(3.4rem,8.5vw,6rem)] leading-[0.88] font-extrabold tracking-[0.005em] text-on-cloth uppercase"
            >
              Your side projects are overdue.
            </h1>
            <p className="mt-7 max-w-[36rem] text-lg leading-relaxed text-on-cloth-muted sm:text-xl">
              Job Not Finished reads your public GitHub repos, keeps a date-due card for every
              project you commit to, and mails you a roast every Sunday about the ones you&apos;ve
              neglected. Until you ship, or honestly let go.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <CheckRecord />
              <a href={REPO_URL} className="link-cloth inline-flex items-center gap-2">
                <GitHubMark className="size-4" />
                Read the source
              </a>
            </div>
            <p className="typed mt-6 text-[0.78rem] tracking-[0.16em] text-on-cloth-muted">
              READ-ONLY · PUBLIC REPOS ONLY · FREE AND OPEN SOURCE
            </p>
          </div>
        </section>

        <section aria-labelledby="stamps" className="mx-auto max-w-6xl px-4 pt-16 pb-24 sm:px-6">
          <SectionHeading id="stamps">Five stamps run the whole desk.</SectionHeading>
          <p className="mt-4 max-w-[38rem] text-lg text-on-cloth-muted">
            No boards, no tickets, no streaks. One card per project, and five stamps.
          </p>
          <ol className="stock mt-10 grid gap-px overflow-hidden bg-red/25 sm:grid-cols-2 lg:grid-cols-5">
            {STAMPS.map((s) => (
              <li
                key={s.label}
                className="bg-card [background-image:var(--tooth)] px-6 pt-8 pb-7 sm:last:col-span-2 lg:last:col-span-1"
              >
                <Stamp ink={s.ink} tilt={s.tilt} className="text-[1.45rem]">
                  {s.label}
                </Stamp>
                <p className="typed mt-5 text-[0.9rem] leading-6 text-ink">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="demo"
          className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-20"
        >
          <div>
            <SectionHeading id="demo">Go on, return one.</SectionHeading>
            <div className="mt-6 grid max-w-[34rem] gap-4 text-lg leading-relaxed text-on-cloth-muted">
              <p>
                Every repo gets a card like this one. The last push, stars, and open issues come
                straight from GitHub. Progress and the due date are yours to keep honest.
              </p>
              <p>
                The note at the bottom is rewritten every week from the facts. It stings the
                project, never you, and it gets meaner the longer a project sits.
              </p>
            </div>
          </div>
          <div className="flex justify-center lg:justify-start">
            <DemoCard initial={demo} now={now} />
          </div>
        </section>

        <section aria-labelledby="notice" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="max-w-[40rem]">
            <SectionHeading id="notice">Every Sunday, a notice.</SectionHeading>
            <p className="mt-4 text-lg text-on-cloth-muted">
              One email a week, only about the projects you checked out. One click to stop.
            </p>
          </div>
          <div className="mt-12">
            <NoticeSheet now={now} />
            <p className="typed mx-auto mt-6 max-w-[42rem] text-center text-[0.74rem] tracking-[0.14em] text-on-cloth-muted">
              SAMPLE NOTICE · WRITTEN BY THE SAME ROAST ENGINE AS THE REAL ONES
            </p>
          </div>
        </section>

        <section
          aria-labelledby="terms"
          className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,38rem)] lg:gap-20"
        >
          <div>
            <SectionHeading id="terms">Terms of borrowing.</SectionHeading>
            <p className="mt-4 max-w-[26rem] text-lg text-on-cloth-muted">
              The whole deal, in plain words. The{" "}
              <Link href="/privacy" className="link-cloth">
                privacy page
              </Link>{" "}
              has the rest.
            </p>
          </div>
          <ol className="stock ruled list-none px-6 py-6 [--line:1.75rem] [--margin:3rem] [--rule-offset:18px] sm:px-8">
            {TERMS.map((t, i) => (
              <li key={i} className="typed grid grid-cols-[1.9rem_1fr] text-[0.92rem] leading-7">
                <span className="text-red">{i + 1}.</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="close" className="px-4 pt-20 pb-32 sm:px-6">
          <div className="stock stock-manila mx-auto flex max-w-[46rem] flex-col items-center px-6 pt-16 pb-12 text-center">
            <h2 id="close" className="sr-only">
              Job&apos;s not finished.
            </h2>
            <Stamp
              ink="red"
              tilt={-4}
              className="text-[clamp(1.9rem,6.4vw,3.9rem)] [--stamp-opacity:0.92]"
            >
              Job&apos;s not finished.
            </Stamp>
            <p className="typed mt-8 max-w-[30rem] text-[0.95rem] leading-7 text-ink">
              Somewhere in your GitHub is a project you swore you&apos;d finish. Find out how
              overdue it is.
            </p>
            <CheckRecord className="mt-8" />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
