"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Stamp } from "@/components/stamp";
import { finishWelcome } from "@/app/(app)/welcome/actions";
import { languageColor } from "@/lib/languages";

export type Candidate = {
  id: string;
  name: string;
  language: string | null;
  description: string | null;
  lastPush: string;
  roast: string;
};

/** A ledger of candidate projects; ticking one stamps it CHECKED OUT. */
export function CheckoutPicker({ candidates }: { candidates: Candidate[] }) {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const count = picked.size;

  return (
    <form action={finishWelcome} className="grid gap-8">
      <ul className="stock divide-y divide-dashed divide-ink/25 px-2 sm:px-4">
        {candidates.map((c) => {
          const on = picked.has(c.id);
          return (
            <li key={c.id}>
              <label className="grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 px-2 py-4 sm:grid-cols-[auto_minmax(0,1fr)_9rem]">
                <input
                  type="checkbox"
                  name="project"
                  value={c.id}
                  checked={on}
                  aria-label={`Check out ${c.name}`}
                  aria-describedby={`${c.id}-about`}
                  onChange={(e) => {
                    const next = new Set(picked);
                    if (e.currentTarget.checked) next.add(c.id);
                    else next.delete(c.id);
                    setPicked(next);
                  }}
                  className="mt-1 size-5 accent-violet"
                />
                <span id={`${c.id}-about`} className="min-w-0">
                  <span className="typed flex flex-wrap items-center gap-x-3 font-bold">
                    {c.name}
                    <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-normal text-ink-muted">
                      <span
                        aria-hidden
                        className="size-2.5 rounded-full ring-1 ring-ink/25"
                        style={{ backgroundColor: languageColor(c.language) }}
                      />
                      {c.language ?? "Unclassified"} · {c.lastPush}
                    </span>
                  </span>
                  {c.description && (
                    <span className="typed mt-0.5 block text-[0.84rem] leading-6 text-ink-muted">
                      {c.description}
                    </span>
                  )}
                  <span className="typed mt-1 block text-[0.84rem] leading-6 italic">
                    {c.roast}
                  </span>
                </span>
                <span className="col-start-2 mt-2 flex sm:col-start-3 sm:mt-0 sm:justify-end">
                  {on && (
                    <Stamp ink="violet" tilt={-7} animate className="text-[1.05rem]">
                      Checked out
                    </Stamp>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <Submit count={count} />
        <p className="text-sm text-on-cloth-muted" aria-live="polite">
          {count === 0
            ? "Nothing ticked: you'll land on your shelf and can check things out later."
            : count <= 3
              ? `${count} of a sensible three. Each one is due in 30 days.`
              : `${count} at once? Bold. We'll hold you to every one.`}
        </p>
      </div>
    </form>
  );
}

function Submit({ count }: { count: number }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-card">
      {pending
        ? "Stamping…"
        : count
          ? `Check out ${count} project${count === 1 ? "" : "s"}`
          : "Skip for now"}
    </button>
  );
}
