import { Stamp } from "@/components/stamp";
import { demoProjects } from "@/lib/demo";
import { addDays, daysSince, stampDate } from "@/lib/projects";
import { roast } from "@/lib/roast";

/** The weekly email as a printed overdue notice, filled with sample projects. */
export function NoticeSheet({ now }: { now: Date }) {
  const sunday = addDays(now, (7 - now.getUTCDay()) % 7);
  const projects = demoProjects(now);

  return (
    <figure
      aria-label="Sample weekly overdue notice"
      className="stock stock-notice tractor mx-auto w-full max-w-[42rem] rotate-[0.6deg] px-10 pt-8 pb-10 sm:px-14"
    >
      <div className="typed text-[0.8rem] leading-6 text-ink sm:text-[0.86rem]">
        <div className="flex flex-wrap justify-between gap-x-4 text-ink-muted">
          <span>JOB NOT FINISHED / CIRCULATION DESK</span>
          <span>SUN {stampDate(sunday)}</span>
        </div>
        <p className="mt-5 text-center text-[1.4rem] font-bold tracking-[0.28em] sm:text-[1.6rem]">
          OVERDUE NOTICE
        </p>
        <div className="mt-4 flex items-center justify-between gap-4">
          <p>Borrower: you</p>
          <Stamp ink="red" tilt={-7} className="mr-1 text-[1.35rem] sm:text-[1.6rem]">
            Second notice
          </Stamp>
        </div>
        <p className="mt-2">Our records show the following projects checked out in your name:</p>

        <ol className="mt-4 border-t border-dashed border-ink/40">
          {projects.map((p) => {
            const days = daysSince(p.pushedAt, now) ?? 0;
            return (
              <li key={p.id} className="border-b border-dashed border-ink/40 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <span className="font-bold">{p.name}</span>
                  <span className="text-ink-muted">
                    DUE {p.dueAt ? stampDate(p.dueAt) : "--"} · LAST PUSH {days}d AGO · {p.progress}
                    %
                  </span>
                </div>
                <p className="mt-1 italic">{roast(p, now)}</p>
              </li>
            );
          })}
        </ol>

        <p className="mt-5">
          Return them, renew them, or withdraw them. The desk is open all week.
        </p>
        <p className="mt-5 text-[0.74rem] leading-5 text-ink-muted">
          You get this because you checked these projects out. One click unsubscribes. No hard
          feelings.
        </p>
      </div>
    </figure>
  );
}
