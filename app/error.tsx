"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => console.error(error), [error]);
  return (
    <main className="mx-auto flex max-w-6xl justify-center px-4 pt-24 pb-28 sm:px-6">
      <section role="alert" className="stock w-full max-w-[30rem] px-8 pt-10 pb-12">
        <p className="typed text-[0.72rem] tracking-[0.2em] text-ink-muted">
          {error.digest ? `INCIDENT ${error.digest}` : "INCIDENT REPORT"}
        </p>
        <h1 className="typed mt-4 text-[1.4rem] leading-8 font-bold">The card catalog jammed.</h1>
        <p className="typed mt-3 leading-7">
          Something broke on our side. Your projects are fine. Try again, and if it keeps happening,
          tell us on GitHub.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="btn btn-slip btn-slip-solid">
            Try again
          </button>
          <Link href="/" className="btn btn-slip">
            Front desk
          </Link>
        </div>
      </section>
    </main>
  );
}
