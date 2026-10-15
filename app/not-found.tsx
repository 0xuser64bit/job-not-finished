import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Stamp } from "@/components/stamp";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl justify-center px-4 pt-10 pb-28 sm:px-6">
        <section className="stock ruled relative w-full max-w-[30rem] px-8 pt-10 pb-12 [--margin:2.5rem] sm:pl-14">
          <p className="typed text-[0.72rem] tracking-[0.2em] text-ink-muted">CALL NO. 404</p>
          <h1 className="typed mt-4 text-[1.4rem] leading-8 font-bold">
            This title is not in our catalog.
          </h1>
          <p className="typed mt-3 leading-7">
            Misfiled, withdrawn, or never written. Happens to the best side projects.
          </p>
          <Link href="/" className="btn btn-slip btn-slip-solid mt-8">
            Back to the front desk
          </Link>
          <Stamp ink="red" tilt={-12} className="absolute top-8 right-6 text-[1.6rem]">
            Missing
          </Stamp>
        </section>
      </main>
    </>
  );
}
