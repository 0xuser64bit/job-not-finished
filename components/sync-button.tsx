"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import { syncNow } from "@/app/(app)/dashboard/actions";
import { cn } from "@/lib/cn";

/** Shows when the catalog last synced; syncs on mount when it's stale. */
export function SyncButton({ label, stale }: { label: string; stale: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const auto = useRef(false);

  const run = () =>
    start(async () => {
      const result = await syncNow();
      setError(result.ok ? null : result.error);
    });

  const syncIfStale = useEffectEvent(() => {
    if (stale && !auto.current) {
      auto.current = true;
      run();
    }
  });
  useEffect(() => syncIfStale(), []);

  return (
    <div className="typed text-[0.78rem] leading-5 text-ink-muted" aria-live="polite">
      <span>{pending ? "Pulling from GitHub…" : label}</span>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="ml-3 inline-flex cursor-pointer items-center gap-1.5 font-bold text-ink underline decoration-ink/30 underline-offset-2 hover:decoration-ink disabled:cursor-wait disabled:opacity-60"
      >
        <RefreshCw aria-hidden className={cn("size-3", pending && "animate-spin")} />
        Sync now
      </button>
      {error && (
        <p role="alert" className="mt-1 font-bold text-red">
          {error}
        </p>
      )}
    </div>
  );
}
