"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { updateProject } from "@/app/(app)/dashboard/actions";
import { CatalogCard, type CardProject } from "@/components/catalog-card";
import { transition, type CardAction } from "@/lib/lifecycle";
import { standing } from "@/lib/projects";
import { thunk } from "@/lib/thunk";

/** Long enough to see a stamp land before the card is filed in another drawer. */
const FILE_AWAY_MS = 1100;

/**
 * A catalog card wired to the server: the stamp lands optimistically, the
 * server confirms, and only then does the page refresh to re-file the card.
 * Keyed by updatedAt upstream, so fresh server data resets local state.
 */
export function ProjectCard({ project, now }: { project: CardProject; now: Date }) {
  const router = useRouter();
  const [settled, setSettled] = useState(project);
  const [optimistic, apply] = useOptimistic(settled, (p, action: CardAction) => ({
    ...p,
    ...transition(p, action, now),
  }));
  const [pending, start] = useTransition();
  const [fresh, setFresh] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <CatalogCard
      project={optimistic}
      now={now}
      pending={pending}
      fresh={fresh}
      error={error}
      onAction={(action) => {
        const next = transition(optimistic, action, now);
        if (!next) return;
        const moved = standing(next, now) !== standing(optimistic, now);
        setError(null);
        setFresh(next.status !== optimistic.status);
        if (action.type === "return") thunk();
        start(async () => {
          apply(action);
          const result = await updateProject(project.id, action);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setSettled((p) => ({ ...p, ...next }));
          if (moved) setTimeout(() => router.refresh(), FILE_AWAY_MS);
        });
      }}
    />
  );
}
