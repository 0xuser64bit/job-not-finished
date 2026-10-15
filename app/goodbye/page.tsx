import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Stamp } from "@/components/stamp";

export const metadata: Metadata = { title: "Card closed", robots: { index: false } };

export default function Goodbye() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl justify-center px-4 pt-10 pb-28 sm:px-6">
        <section className="stock flex w-full max-w-[34rem] flex-col items-center px-8 pt-12 pb-12 text-center">
          <Stamp ink="black" tilt={-5} className="text-[2rem]">
            Card closed
          </Stamp>
          <h1 className="typed mt-8 text-[1.15rem] font-bold">Your record is gone.</h1>
          <p className="typed mt-3 leading-7">
            Account, projects, and the GitHub token we held: all deleted, and the app is off your
            GitHub authorizations. The projects themselves are still on GitHub, still waiting.
          </p>
          <Link href="/" className="btn btn-slip mt-8">
            Back to the front desk
          </Link>
        </section>
      </main>
    </>
  );
}
