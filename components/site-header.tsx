import Link from "next/link";
import { GitHubMark } from "@/components/github-mark";
import { Mark } from "@/components/mark";
import { REPO_URL } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
      <Link href="/" className="flex min-w-0 items-center gap-3 rounded-sm text-on-cloth">
        <Mark className="size-11 shrink-0" />
        <span className="truncate font-display text-xl leading-none font-extrabold tracking-[0.12em] uppercase max-[22rem]:hidden">
          Job Not Finished
        </span>
      </Link>
      <nav aria-label="Site" className="flex shrink-0 items-center gap-5 text-sm">
        <a
          href={REPO_URL}
          className="link-cloth hidden items-center gap-2 no-underline sm:inline-flex"
        >
          <GitHubMark className="size-4" />
          Source
        </a>
        <Link href="/sign-in" className="link-cloth font-semibold">
          Sign in
        </Link>
      </nav>
    </header>
  );
}
