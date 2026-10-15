import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Stamp } from "@/components/stamp";
import { db } from "@/lib/db";
import { verify } from "@/lib/tokens";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

type Search = { u?: string; t?: string; done?: string };

async function unsubscribe(formData: FormData) {
  "use server";
  const userId = String(formData.get("u") ?? "");
  const signature = String(formData.get("t") ?? "");
  if (!verify("unsubscribe", userId, signature)) return;
  await db.user.updateMany({ where: { id: userId }, data: { digestEnabled: false } });
  redirect("/unsubscribe?done=1");
}

/** Link scanners prefetch GET links, so the email link only shows a button; POST does the work. */
export default async function Unsubscribe({ searchParams }: { searchParams: Promise<Search> }) {
  const { u = "", t = "", done } = await searchParams;
  const valid = Boolean(done) || verify("unsubscribe", u, t);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl justify-center px-4 pt-10 pb-28 sm:px-6">
        <section className="stock stock-notice tractor w-full max-w-[34rem] px-12 pt-10 pb-12 text-center">
          {done ? (
            <>
              <Stamp ink="black" tilt={-5} className="text-[1.7rem]">
                Notices stopped
              </Stamp>
              <p className="typed mt-6 leading-7">
                No more Sunday notices. Your card and catalog are still there if you change your
                mind; turn notices back on from settings.
              </p>
            </>
          ) : valid ? (
            <form action={unsubscribe} className="grid justify-items-center gap-6">
              <input type="hidden" name="u" value={u} />
              <input type="hidden" name="t" value={t} />
              <h1 className="typed text-[1.3rem] font-bold tracking-[0.12em]">
                STOP WEEKLY NOTICES?
              </h1>
              <p className="typed leading-7">
                You&apos;ll stop getting the Sunday overdue notice. Your projects stay as they are.
              </p>
              <button type="submit" className="btn btn-slip btn-slip-solid">
                Unsubscribe
              </button>
            </form>
          ) : (
            <>
              <h1 className="typed text-[1.3rem] font-bold tracking-[0.12em]">
                THIS LINK IS SMUDGED
              </h1>
              <p className="typed mt-4 leading-7">
                We couldn&apos;t read that unsubscribe link. Sign in and pause notices from{" "}
                <Link href="/settings" className="underline underline-offset-2">
                  settings
                </Link>{" "}
                instead.
              </p>
            </>
          )}
        </section>
      </main>
    </>
  );
}
