"use client";

import { useSyncExternalStore } from "react";
import { Stamp } from "@/components/stamp";
import { stampDate } from "@/lib/projects";

const subscribe = () => () => {};

/**
 * The date stamp is always set to today. The server renders its own date;
 * the browser swaps in the visitor's after hydration without a mismatch.
 */
export function TodayStamp({ serverDate, className }: { serverDate: Date; className?: string }) {
  const iso = useSyncExternalStore(
    subscribe,
    () => new Date().toLocaleDateString("en-CA"), // local YYYY-MM-DD
    () => serverDate.toISOString().slice(0, 10),
  );
  return (
    <Stamp ink="violet" bare tilt={1.5} className={className}>
      <time dateTime={iso}>{stampDate(new Date(`${iso}T12:00:00Z`))}</time>
    </Stamp>
  );
}
