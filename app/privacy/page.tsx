import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { REPO_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Exactly what Job Not Finished reads, keeps, and sends, and how to delete it.",
};

function Part({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="font-display text-[1.55rem] leading-none font-extrabold tracking-[0.03em] uppercase">
        {title}
      </h2>
      <div className="mt-4 grid gap-3 text-[1.02rem] leading-7 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:grid [&_ul]:gap-2">
        {children}
      </div>
    </section>
  );
}

export default function Privacy() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-28 sm:px-6">
        <h1 className="font-display text-[clamp(2.6rem,6vw,4rem)] leading-none font-extrabold text-on-cloth uppercase">
          Privacy
        </h1>
        <p className="mt-4 max-w-[40rem] text-lg text-on-cloth-muted">
          Job Not Finished is open source, so this page describes what the code does. If you use
          someone else&apos;s self-hosted copy, its operator answers for it.
        </p>

        <article className="stock mt-10 max-w-[46rem] px-6 py-10 sm:px-12">
          <Part title="What we collect">
            <ul>
              <li>
                From GitHub when you sign in: your user id, username, display name, avatar URL, and
                email address (your public profile email, or your primary one if that&apos;s unset).
              </li>
              <li>
                From GitHub on each sync, for every public repository you own: name, description,
                language, links, star, fork and open-issue counts, whether it&apos;s a fork or
                archived, and when it was created and last pushed to.
              </li>
              <li>
                From you: the status, progress, due dates, renewals and epitaphs you set, a
                different address for notices if you add one, and whether your record is public.
              </li>
              <li>
                A GitHub access token with the read:user and user:email scopes, encrypted at rest,
                used only to read the data above.
              </li>
              <li>The IP address and browser stored with each sign-in session, for security.</li>
            </ul>
          </Part>

          <Part title="What we don't">
            <p>
              No private repositories and no code. No analytics, tracking pixels, ads, or
              third-party cookies.
            </p>
          </Part>

          <Part title="How it's used">
            <p>
              To show your catalog, to send one weekly notice about the projects you&apos;ve checked
              out, and to show your public record if you turn it on. Nothing is sold or shared for
              marketing.
            </p>
          </Part>

          <Part title="Who else sees it">
            <ul>
              <li>GitHub, where the data comes from.</li>
              <li>
                Resend, our email provider, which receives your address and each notice to deliver
                it.
              </li>
              <li>
                Our hosting and database providers, which store and process it to run the service.
              </li>
              <li>
                Anyone you share your public record with, only if you turn it on: your username,
                avatar, counts, project names, progress, and epitaphs.
              </li>
            </ul>
          </Part>

          <Part title="Cookies">
            <p>
              A session cookie that keeps you signed in, and short-lived cookies that protect the
              sign-in round trip. Nothing else.
            </p>
          </Part>

          <Part title="Keeping and deleting">
            <p>
              Your data stays while you have an account. Close your card in settings and your
              account, projects, sessions, and token are deleted at once, and the app&apos;s
              authorization is revoked on GitHub. Every notice has a one-click unsubscribe link.
            </p>
          </Part>

          <Part title="Questions">
            <p>
              Open an issue on{" "}
              <a href={REPO_URL} className="underline underline-offset-2">
                GitHub
              </a>
              . Report security problems privately, as described in the repository&apos;s
              SECURITY.md.
            </p>
            <p className="typed text-[0.85rem] text-ink-muted">Last updated October 15, 2026.</p>
          </Part>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
