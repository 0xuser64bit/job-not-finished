import { Stamp } from "@/components/stamp";
import { TodayStamp } from "@/components/today-stamp";
import { SLIP_PUSHES } from "@/lib/demo";
import { cn } from "@/lib/cn";
import { stampDate } from "@/lib/projects";

const ROWS = 6;
const TILTS = [-2, 1.5, -1, 2.5, -2.5, 1];
const NUDGE = ["ml-1", "ml-4", "ml-2", "ml-5", "ml-0", "ml-3"];

/**
 * The hero artifact: a date-due slip tucked into its book pocket, whose stamps
 * are pushes. The gaps between them widen, then stop, and OVERDUE lands across
 * the rest.
 */
export function DateDueSlip({ now, className }: { now: Date; className?: string }) {
  const left = Array.from({ length: ROWS }, (_, i) => SLIP_PUSHES[i]);
  return (
    <figure
      aria-label="Sample date-due slip for a project called todo-app-v3: five pushes in 2024, then nothing. Stamped overdue."
      className={cn("relative w-full max-w-[23rem] pb-3", className)}
    >
      <div className="stock rotate-[-1.5deg] animate-jolt px-5 pt-5 pb-24 [animation-delay:1500ms]">
        <div className="typed flex justify-between text-[0.8rem] leading-5 text-ink-muted">
          <span>TITLE: todo-app-v3</span>
          <span>CALL 005.133</span>
        </div>
        <p className="typed mt-3 text-center text-[1.7rem] font-bold tracking-[0.3em] text-ink">
          DATE DUE
        </p>
        <div className="mx-auto mt-1 h-[5px] border-y border-red/70" />
        <p className="typed mt-2 text-center text-[0.78rem] leading-tight text-ink-muted">
          This project is due on the last date stamped below.
        </p>

        <div className="lines relative mt-3 grid grid-cols-2 border-t border-rule [--line:2.75rem]">
          <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-red/40" />
          <ol className="contents">
            {left.map((date, i) => (
              <li key={i} className="col-start-1 flex h-11 items-center">
                {date && (
                  <Stamp
                    ink="violet"
                    bare
                    tilt={TILTS[i]}
                    animate
                    delay={250 + i * 170}
                    className={cn("text-[1.3rem]", NUDGE[i])}
                  >
                    <time dateTime={date.toISOString().slice(0, 10)}>{stampDate(date)}</time>
                  </Stamp>
                )}
              </li>
            ))}
            <li className="col-start-2 row-start-1 flex h-11 items-center pl-4">
              <TodayStamp serverDate={now} className="text-[1.3rem] opacity-30" />
            </li>
          </ol>
          <Stamp
            ink="red"
            tilt={-14}
            animate
            delay={1350}
            className="absolute top-[66%] left-[7%] border-[0.11em] px-4 text-[3.4rem] [--stamp-opacity:0.88]"
          >
            Overdue
          </Stamp>
        </div>
      </div>

      {/* The book pocket the slip lives in, with its thumb notch. */}
      <figcaption className="stock pocket absolute inset-x-[-0.4rem] bottom-0 flex h-[6.5rem] rotate-[0.6deg] flex-col items-center justify-end pb-4 text-center">
        <span className="font-display text-[1.05rem] leading-none font-extrabold tracking-[0.22em] text-ink uppercase">
          Job Not Finished
        </span>
        <span className="typed mt-1.5 text-[0.68rem] tracking-[0.12em] text-ink">
          SAMPLE · DO NOT REMOVE CARD FROM POCKET
        </span>
      </figcaption>
    </figure>
  );
}
