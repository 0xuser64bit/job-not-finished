import Link from "next/link";
import { Mark } from "@/components/mark";
import { REPO_URL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-on-cloth/15">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-on-cloth-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Mark className="size-9 text-on-cloth-muted" />
          <p>
            Job Not Finished is free and open source under the MIT license.
            <br />
            No ads, no tracking, no paid tier.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <a href={REPO_URL} className="link-cloth">
            Source on GitHub
          </a>
          <a href={`${REPO_URL}#self-hosting`} className="link-cloth">
            Self-host it
          </a>
          <Link href="/privacy" className="link-cloth">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
