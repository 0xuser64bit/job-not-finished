"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { CatalogCard, type CardProject } from "@/components/catalog-card";
import { transition } from "@/lib/lifecycle";
import { thunk } from "@/lib/thunk";

/** The marketing page's working sample card: real lifecycle rules, local state. */
export function DemoCard({ initial, now }: { initial: CardProject; now: Date }) {
  const [project, setProject] = useState(initial);
  const [fresh, setFresh] = useState(false);
  const changed = project !== initial;

  return (
    <div className="grid w-full max-w-[25rem] gap-3">
      <CatalogCard
        project={project}
        now={now}
        fresh={fresh}
        onAction={(action) => {
          const next = transition(project, action, now);
          if (!next) return;
          if (action.type === "return") thunk();
          setFresh(next.status !== project.status);
          setProject({ ...project, ...next });
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="typed text-[0.74rem] tracking-[0.14em] text-on-cloth-muted">
          SAMPLE CARD · TRY THE BUTTONS
        </p>
        <button
          type="button"
          onClick={() => {
            setProject(initial);
            setFresh(false);
          }}
          className={`link-cloth inline-flex items-center gap-1.5 text-sm ${changed ? "" : "invisible"}`}
        >
          <RotateCcw aria-hidden className="size-3.5" />
          Reset
        </button>
      </div>
    </div>
  );
}
