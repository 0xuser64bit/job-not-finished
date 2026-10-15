import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GitHubMark } from "@/components/github-mark";
import { SiteHeader } from "@/components/site-header";
import { signIn } from "@/lib/auth-actions";
import { getUser } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

// Better Auth redirects here with ?error=<code> when an OAuth round trip fails.
function problem(code?: string) {
  if (!code) return null;
  if (code === "access_denied") return "You cancelled on GitHub. No harm done.";
  if (code.includes("state") || code.includes("restart")) {
    return "That sign-in attempt expired. Give it another go.";
  }
  if (code === "account_not_linked") {
    return "That email already belongs to a different card. Sign in with the GitHub account you used before.";
  }
  return "GitHub sign-in didn't go through. Try again in a moment.";
}

const TERMS: [string, string][] = [
  ["WE READ", "Your public repos, your profile, your email address."],
  ["WE NEVER", "See private repos, write to GitHub, or sell anything."],
  ["WE SEND", "One notice a week about what you check out. One click stops it."],
];

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getUser()) redirect("/dashboard");
  const error = problem((await searchParams).error);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl justify-center px-4 pt-10 pb-28 sm:px-6">
        <section
          aria-labelledby="apply"
          className="stock w-full max-w-[34rem] px-6 pt-8 pb-9 sm:px-10"
        >
          <h1 id="apply" className="typed text-[1.5rem] leading-8 font-bold tracking-[0.12em]">
            APPLICATION FOR A BORROWER&apos;S CARD
          </h1>
          <p className="typed mt-3 text-[0.92rem] leading-7">
            Your GitHub account is your library card. Here&apos;s exactly what that lets us do:
          </p>
          <dl className="typed mt-4 grid gap-3 text-[0.9rem] leading-7">
            {TERMS.map(([term, detail]) => (
              <div key={term} className="grid gap-x-4 sm:grid-cols-[6.5rem_1fr]">
                <dt className="font-bold text-red">{term}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
          {error && (
            <p role="alert" className="typed mt-6 font-bold text-red">
              {error}
            </p>
          )}
          <form action={signIn} className="mt-8">
            <button type="submit" className="btn btn-card w-full sm:w-auto">
              <GitHubMark className="size-5" />
              Continue with GitHub
            </button>
          </form>
          <p className="typed mt-6 text-[0.78rem] leading-6 text-ink-muted">
            Read the{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              privacy page
            </Link>{" "}
            for the details. Close your card any time from settings.
          </p>
        </section>
      </main>
    </>
  );
}
