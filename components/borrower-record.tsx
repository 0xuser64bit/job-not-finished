import Image from "next/image";
import { Stamp, type Ink } from "@/components/stamp";
import { SyncButton } from "@/components/sync-button";
import { stampDate, type Tally } from "@/lib/projects";

type Props = {
  login: string | null;
  name: string;
  image: string | null;
  memberSince: Date;
  tally: Tally;
  syncLabel: string;
  stale: boolean;
};

function verdict(t: Tally): { label: string; ink: Ink } {
  if (t.overdue) return { label: `${t.overdue} overdue`, ink: "red" };
  if (t.onLoan) return { label: "In good standing", ink: "violet" };
  if (t.returned) return { label: "Nothing overdue", ink: "green" };
  return { label: "Nothing checked out", ink: "black" };
}

/** The top of the catalog: who you are, and what you owe. */
export function BorrowerRecord({
  login,
  name,
  image,
  memberSince,
  tally: t,
  syncLabel,
  stale,
}: Props) {
  const v = verdict(t);
  const rows: [string, number][] = [
    ["Checked out", t.onLoan + t.overdue],
    ["  of which overdue", t.overdue],
    ["Returned", t.returned],
    ["Withdrawn", t.withdrawn],
    ["On the shelf", t.shelf],
    ["Untouched 90+ days", t.dormant],
  ];

  return (
    <section
      aria-label="Borrower record"
      className="stock grid gap-x-10 gap-y-8 px-5 py-6 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,19rem)]"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-5">
          {image && (
            <Image
              src={image}
              alt=""
              width={88}
              height={88}
              className="size-[5.5rem] shrink-0 rounded-[2px] border-4 border-card mix-blend-multiply shadow-[0_0_0_1px_rgb(0_0_0/0.25)] contrast-110 grayscale"
            />
          )}
          <div className="min-w-0">
            <h1 className="typed text-[1.6rem] leading-8 font-bold break-words">
              {login ? `@${login}` : name}
            </h1>
            {login && name !== login && <p className="typed text-sm text-ink-muted">{name}</p>}
            <p className="typed mt-1 text-[0.78rem] text-ink-muted">
              Card issued {stampDate(memberSince)}
            </p>
          </div>
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
          <SyncButton label={syncLabel} stale={stale} />
          <Stamp ink={v.ink} tilt={-6} className="text-[1.5rem]">
            {v.label}
          </Stamp>
        </div>
      </div>

      <dl className="typed self-start border-red/40 text-[0.88rem] md:border-l md:pl-8">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline gap-2 leading-8">
            <dt className="shrink-0 whitespace-pre">{label}</dt>
            <span aria-hidden className="flex-1 border-b-2 border-dotted border-ink/30" />
            <dd className="font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
