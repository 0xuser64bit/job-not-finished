"use client";

import { CircleDot, ExternalLink, GitFork, Pencil, Star } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Stamp, type Ink } from "@/components/stamp";
import { cn } from "@/lib/cn";
import { languageColor } from "@/lib/languages";
import { EPITAPH_MAX, type CardAction, type Lifecycle } from "@/lib/lifecycle";
import { stampDate, standing, type Standing } from "@/lib/projects";
import { roast } from "@/lib/roast";

export type CardProject = Lifecycle & {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  htmlUrl: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  isFork: boolean;
  isArchived: boolean;
  repoCreatedAt: Date;
  pushedAt: Date | null;
};

const STANDING: Record<Standing, { label: string; ink: Ink } | null> = {
  shelf: null,
  "on-loan": { label: "On loan", ink: "violet" },
  overdue: { label: "Overdue", ink: "red" },
  returned: { label: "Returned", ink: "green" },
  withdrawn: { label: "Withdrawn", ink: "black" },
};

type Props = {
  project: CardProject;
  now: Date;
  onAction: (action: CardAction) => void;
  pending?: boolean;
  /** Slam the status stamp in: set after a user action changes it. */
  fresh?: boolean;
  error?: string | null;
  className?: string;
};

/** A project as a library catalog card. Pure UI: the parent owns state. */
export function CatalogCard({
  project: p,
  now,
  onAction,
  pending,
  fresh,
  error,
  className,
}: Props) {
  const s = standing(p, now);
  const stamp = STANDING[s];
  const active = s === "on-loan" || s === "overdue";
  const [withdrawing, setWithdrawing] = useState(false);

  return (
    <article
      aria-label={`${p.name}${stamp ? `, ${stamp.label.toLowerCase()}` : ", on the shelf"}`}
      aria-busy={pending || undefined}
      className={cn("stock ruled punched flex flex-col pt-3 pb-11 [--margin:3.4rem]", className)}
    >
      <header className="grid grid-cols-[3.4rem_minmax(0,1fr)] items-start pr-3">
        <p className="typed pt-0.5 pl-2.5 text-[0.68rem] leading-4 text-ink-muted" aria-hidden>
          005.
          <br />
          133
          <br />
          {p.name
            .replace(/[^a-z0-9]/gi, "")
            .slice(0, 3)
            .toUpperCase()}
        </p>
        <div className="min-w-0 pl-2.5">
          {stamp && (
            <Stamp
              key={stamp.label}
              ink={stamp.ink}
              tilt={stamp.ink === "red" ? -9 : -6}
              animate={fresh}
              className="float-right mt-0.5 mb-1 ml-2 text-[1rem]"
            >
              {stamp.label}
            </Stamp>
          )}
          <h3 className="typed text-[1.05rem] leading-6 font-bold break-words">
            {p.htmlUrl ? (
              <a
                href={p.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline decoration-ink/40 hover:underline"
              >
                {p.name}
                <ExternalLink
                  aria-label="(opens GitHub)"
                  className="ml-1 inline size-3.5 align-[-1px] opacity-40 group-hover:opacity-80"
                />
              </a>
            ) : (
              p.name
            )}
          </h3>
          <p className="typed line-clamp-2 text-[0.84rem] leading-6 text-ink-muted">
            {p.description ?? "No description. Mysterious."}
          </p>
        </div>
      </header>

      <Dates p={p} s={s} now={now} onAction={onAction} pending={pending} />

      <p className="typed flex flex-wrap items-center gap-x-3 gap-y-1 pl-[3.95rem] text-[0.78rem] leading-6 text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2.5 rounded-full ring-1 ring-ink/25"
            style={{ backgroundColor: languageColor(p.language) }}
          />
          {p.language ?? "Unclassified"}
        </span>
        <span className="inline-flex items-center gap-1" title="Stars">
          <Star aria-hidden className="size-3.5" />
          <span className="sr-only">Stars</span>
          {p.stars}
        </span>
        <span className="inline-flex items-center gap-1" title="Forks">
          <GitFork aria-hidden className="size-3.5" />
          <span className="sr-only">Forks</span>
          {p.forks}
        </span>
        {p.openIssues > 0 && (
          <span className="inline-flex items-center gap-1">
            <CircleDot aria-hidden className="size-3.5" />
            {p.openIssues} open
          </span>
        )}
        {p.isFork && <span className="tracking-widest">FORK</span>}
        {p.isArchived && <span className="tracking-widest">ARCHIVED</span>}
      </p>

      {/* Keyed so a server-confirmed value replaces the local one. */}
      {active && <Progress key={p.progress} p={p} onAction={onAction} pending={pending} />}

      <p className="typed mt-2 pr-4 pl-[3.95rem] text-[0.88rem] leading-6 italic">
        <span className="mr-1.5 font-bold text-red not-italic">NOTE</span>
        {s === "withdrawn" && p.epitaph ? `“${p.epitaph}”` : roast(p, now)}
      </p>

      {error && (
        <p
          role="alert"
          className="typed mt-2 pr-4 pl-[3.95rem] text-[0.82rem] leading-5 font-bold text-red"
        >
          {error}
        </p>
      )}

      <div className="mt-auto pt-4 pr-3 pl-[3.95rem]">
        {withdrawing ? (
          <WithdrawForm
            name={p.name}
            pending={pending}
            onCancel={() => setWithdrawing(false)}
            onConfirm={(epitaph) => {
              setWithdrawing(false);
              onAction({ type: "withdraw", epitaph });
            }}
          />
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {s === "shelf" && (
              <>
                <Act solid pending={pending} onClick={() => onAction({ type: "checkout" })}>
                  Check out
                </Act>
                <Quiet pending={pending} onClick={() => setWithdrawing(true)}>
                  Withdraw
                </Quiet>
              </>
            )}
            {active && (
              <>
                <Act solid pending={pending} onClick={() => onAction({ type: "return" })}>
                  Return it
                </Act>
                <Act pending={pending} onClick={() => onAction({ type: "renew" })}>
                  Renew
                </Act>
                <Quiet pending={pending} onClick={() => setWithdrawing(true)}>
                  Withdraw
                </Quiet>
              </>
            )}
            {s === "returned" && (
              <Act pending={pending} onClick={() => onAction({ type: "reopen" })}>
                Reopen
              </Act>
            )}
            {s === "withdrawn" && (
              <Act pending={pending} onClick={() => onAction({ type: "restore" })}>
                Back to the shelf
              </Act>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function Act({
  solid,
  pending,
  onClick,
  children,
}: {
  solid?: boolean;
  pending?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className={cn("btn btn-slip", solid && "btn-slip-solid")}
    >
      {children}
    </button>
  );
}

function Quiet({
  pending,
  onClick,
  children,
}: {
  pending?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="typed ml-auto cursor-pointer px-1 text-[0.82rem] text-ink-muted underline decoration-ink/30 underline-offset-2 hover:text-ink hover:decoration-ink disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function Dates({
  p,
  s,
  now,
  onAction,
  pending,
}: {
  p: CardProject;
  s: Standing;
  now: Date;
  onAction: Props["onAction"];
  pending?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const inputId = useId();
  const second =
    s === "returned"
      ? { label: "Returned", date: p.shippedAt, ink: "green" as const }
      : s === "withdrawn"
        ? { label: "Withdrawn", date: p.buriedAt, ink: "black" as const }
        : s === "shelf"
          ? { label: "Created", date: p.repoCreatedAt, ink: "violet" as const }
          : {
              label: "Due",
              date: p.dueAt,
              ink: s === "overdue" ? ("red" as const) : ("violet" as const),
            };

  return (
    <dl className="mt-2 grid grid-cols-2 gap-x-3 pr-3 pl-[3.95rem]">
      <div>
        <dt className="typed text-[0.66rem] leading-4 tracking-[0.18em] text-ink-muted">
          LAST PUSH
        </dt>
        <dd className="h-8 pt-1">
          {p.pushedAt ? (
            <Stamp ink="violet" bare tilt={-1.5} className="text-[1.15rem]">
              {stampDate(p.pushedAt)}
            </Stamp>
          ) : (
            <span className="typed text-sm text-ink-muted">Never</span>
          )}
        </dd>
      </div>
      <div>
        <dt className="typed text-[0.66rem] leading-4 tracking-[0.18em] text-ink-muted">
          {editing ? <label htmlFor={inputId}>NEW DUE DATE</label> : second.label.toUpperCase()}
        </dt>
        <dd className="h-8 pt-1">
          {editing ? (
            <input
              id={inputId}
              type="date"
              autoFocus
              disabled={pending}
              defaultValue={p.dueAt?.toISOString().slice(0, 10)}
              min={now.toISOString().slice(0, 10)}
              className="field h-7 min-h-0 px-1 py-0 text-sm"
              onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
              onBlur={(e) => {
                setEditing(false);
                const date = e.currentTarget.value;
                if (date && date !== p.dueAt?.toISOString().slice(0, 10))
                  onAction({ type: "due", date });
              }}
            />
          ) : s === "on-loan" || s === "overdue" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => setEditing(true)}
              className="group inline-flex items-center gap-1.5 rounded-sm"
              aria-label={`Due ${second.date ? stampDate(second.date) : "date not set"}. Change due date`}
            >
              <Stamp ink={second.ink} bare tilt={1.5} className="text-[1.15rem]">
                {second.date ? stampDate(second.date) : "SET DATE"}
              </Stamp>
              <Pencil
                aria-hidden
                className="size-3 opacity-0 transition-opacity group-hover:opacity-60 group-focus-visible:opacity-60"
              />
            </button>
          ) : second.date ? (
            <Stamp ink={second.ink} bare tilt={1.5} className="text-[1.15rem]">
              {stampDate(second.date)}
            </Stamp>
          ) : null}
        </dd>
      </div>
      {p.renewals > 0 && (s === "on-loan" || s === "overdue") && (
        <p className="col-span-2 pt-1">
          <Stamp ink="violet" bare tilt={-1.5} className="text-[1.1rem]">
            Renewed {p.renewals}×
          </Stamp>
        </p>
      )}
    </dl>
  );
}

function Progress({
  p,
  onAction,
  pending,
}: {
  p: CardProject;
  onAction: Props["onAction"];
  pending?: boolean;
}) {
  const [value, setValue] = useState(p.progress);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId();

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="mt-1 flex items-center gap-3 pr-4 pl-[3.95rem]">
      <label htmlFor={id} className="typed text-[0.66rem] tracking-[0.18em] text-ink-muted">
        DONE
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        disabled={pending}
        className="range min-w-0 flex-1"
        style={{ "--fill": `${value}%` } as React.CSSProperties}
        onChange={(e) => {
          const next = Number(e.currentTarget.value);
          setValue(next);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => onAction({ type: "progress", value: next }), 450);
        }}
      />
      <output htmlFor={id} className="typed w-10 text-right text-sm font-bold tabular-nums">
        {value}%
      </output>
    </div>
  );
}

function WithdrawForm({
  name,
  pending,
  onCancel,
  onConfirm,
}: {
  name: string;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: (epitaph: string) => void;
}) {
  const id = useId();
  return (
    <form
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm(String(new FormData(e.currentTarget).get("epitaph") ?? ""));
      }}
    >
      <label htmlFor={id} className="typed text-[0.78rem] leading-5">
        Withdraw <strong>{name}</strong> for good? Leave an epitaph if you like.
      </label>
      <input
        id={id}
        name="epitaph"
        autoFocus
        maxLength={EPITAPH_MAX}
        placeholder="Died of scope creep."
        className="field"
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
      />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-slip btn-slip-solid">
          Withdraw
        </button>
        <button type="button" onClick={onCancel} className="btn btn-slip">
          Keep it
        </button>
      </div>
    </form>
  );
}
