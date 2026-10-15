import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BorrowerRecord } from "@/components/borrower-record";
import { EmptyDrawer } from "@/components/empty-drawer";
import { ProjectCard } from "@/components/project-card";
import { ShelfFilters } from "@/components/shelf-filters";
import { db } from "@/lib/db";
import { ago, daysSince, standing, tally } from "@/lib/projects";
import { requireUser } from "@/lib/session";
import { isShelfSort, type ShelfSort } from "@/lib/shelf";

export const metadata: Metadata = { title: "Your catalog" };

const TABS = [
  { id: "loan", label: "On loan" },
  { id: "shelf", label: "Shelf" },
  { id: "returned", label: "Returned" },
  { id: "withdrawn", label: "Withdrawn" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const PAGE_SIZE = 24;
/** Older than this and the dashboard quietly resyncs on load. */
const STALE_MS = 6 * 60 * 60 * 1000;

type Search = Partial<Record<"tab" | "q" | "lang" | "sort" | "forks" | "page", string>>;

export default async function Dashboard({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireUser();
  if (!user.onboardedAt) redirect("/welcome");

  const params = await searchParams;
  const now = new Date();
  const projects = await db.project.findMany({
    where: { userId: user.id },
    omit: { userId: true, repoId: true, fullName: true, homepage: true, createdAt: true },
  });
  const t = tally(projects, now);
  const counts: Record<Tab, number> = {
    loan: t.onLoan + t.overdue,
    shelf: t.shelf,
    returned: t.returned,
    withdrawn: t.withdrawn,
  };
  const tab: Tab =
    TABS.find((x) => x.id === params.tab)?.id ?? (counts.loan > 0 ? "loan" : "shelf");

  // Shelf filters (ignored on other tabs).
  const q = params.q?.trim().toLowerCase() ?? "";
  const lang = params.lang ?? "";
  const sort: ShelfSort = isShelfSort(params.sort) ? params.sort : "pushed";
  const forks = params.forks === "1";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const pushedDays = (p: (typeof projects)[number]) =>
    daysSince(p.pushedAt ?? p.repoCreatedAt, now) ?? 0;
  let visible = projects.filter((p) => {
    const s = standing(p, now);
    if (tab === "loan") return s === "on-loan" || s === "overdue";
    if (tab === "returned") return s === "returned";
    if (tab === "withdrawn") return s === "withdrawn";
    return (
      s === "shelf" &&
      (forks || !p.isFork) &&
      (!lang || p.language === lang) &&
      (!q || p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    );
  });

  if (tab === "loan") {
    // Most overdue first, then whatever is due soonest.
    visible.sort((a, b) => (a.dueAt?.getTime() ?? Infinity) - (b.dueAt?.getTime() ?? Infinity));
  } else if (tab === "returned") {
    visible.sort((a, b) => (b.shippedAt?.getTime() ?? 0) - (a.shippedAt?.getTime() ?? 0));
  } else if (tab === "withdrawn") {
    visible.sort((a, b) => (b.buriedAt?.getTime() ?? 0) - (a.buriedAt?.getTime() ?? 0));
  } else {
    const by: Record<
      ShelfSort,
      (a: (typeof visible)[number], b: (typeof visible)[number]) => number
    > = {
      pushed: (a, b) => pushedDays(a) - pushedDays(b),
      neglected: (a, b) => pushedDays(b) - pushedDays(a),
      stars: (a, b) => b.stars - a.stars || pushedDays(a) - pushedDays(b),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    visible.sort(by[sort]);
  }

  const total = visible.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (tab === "shelf") visible = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const languages = [
    ...new Set(projects.filter((p) => p.status === "IDLE" && p.language).map((p) => p.language!)),
  ].sort();
  const pageHref = (n: number) => {
    const next = new URLSearchParams({ ...params, tab: "shelf", page: String(n) } as Record<
      string,
      string
    >);
    return `/dashboard?${next}`;
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-12">
      <BorrowerRecord
        login={user.githubLogin}
        name={user.name}
        image={user.image}
        memberSince={user.createdAt}
        tally={t}
        syncLabel={user.syncedAt ? `Synced with GitHub ${ago(user.syncedAt, now)}` : "Never synced"}
        stale={!user.syncedAt || now.getTime() - user.syncedAt.getTime() > STALE_MS}
      />

      <section aria-labelledby="drawer-heading">
        <h2 id="drawer-heading" className="sr-only">
          Catalog drawer
        </h2>
        <nav aria-label="Drawer" className="flex gap-1 overflow-x-auto border-b-2 border-card">
          {TABS.map((x) => (
            <Link
              key={x.id}
              href={`/dashboard?tab=${x.id}`}
              aria-current={x.id === tab ? "page" : undefined}
              className="drawer-tab"
            >
              {x.label}
              <span className="typed text-[0.85rem] font-normal tracking-normal">
                {counts[x.id]}
              </span>
            </Link>
          ))}
        </nav>

        {tab === "shelf" && (
          <div className="mt-8">
            <ShelfFilters
              q={params.q ?? ""}
              lang={lang}
              sort={sort}
              forks={forks}
              languages={languages}
            />
          </div>
        )}

        <div className="mt-8">
          {visible.length ? (
            <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((p) => (
                <li key={`${p.id}:${p.updatedAt.getTime()}`} className="flex">
                  <ProjectCard project={p} now={now} />
                </li>
              ))}
            </ul>
          ) : tab === "loan" ? (
            <EmptyDrawer
              stamp="Nothing checked out"
              ink="black"
              action={{ href: "/dashboard?tab=shelf", label: "Browse the shelf" }}
            >
              That&apos;s one way to never miss a due date. Pick a project off the shelf and give it
              thirty days.
            </EmptyDrawer>
          ) : tab === "returned" ? (
            <EmptyDrawer stamp="Nothing returned yet" ink="green">
              The first one is the hardest. Every project you ship lands here, stamped.
            </EmptyDrawer>
          ) : tab === "withdrawn" ? (
            <EmptyDrawer stamp="Nothing withdrawn" ink="black">
              Brave, or in denial? Letting a project go on purpose is allowed here. It even gets an
              epitaph.
            </EmptyDrawer>
          ) : q || lang ? (
            <EmptyDrawer
              stamp="No matches"
              ink="violet"
              action={{ href: "/dashboard?tab=shelf", label: "Clear filters" }}
            >
              Nothing on the shelf matches that. Try a different search.
            </EmptyDrawer>
          ) : (
            <EmptyDrawer stamp="Empty shelf" ink="violet">
              No public repositories here. Either you&apos;ve never started a side project, or
              they&apos;re all private. We only ever see public ones.
            </EmptyDrawer>
          )}
        </div>

        {tab === "shelf" && pages > 1 && (
          <nav aria-label="Shelf pages" className="mt-10 flex items-center justify-between text-sm">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="link-cloth">
                Previous page
              </Link>
            ) : (
              <span />
            )}
            <span className="typed text-on-cloth-muted">
              Page {page} of {pages} · {total} on the shelf
            </span>
            {page < pages ? (
              <Link href={pageHref(page + 1)} className="link-cloth">
                Next page
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
