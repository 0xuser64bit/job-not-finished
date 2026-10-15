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
      <button
        type="button"
        onClick={() => {
          setProject(initial);
          setFresh(false);
        }}
        className={`link-cloth inline-flex items-center gap-1.5 justify-self-start text-sm ${changed ? "" : "invisible"}`}
      >
        <RotateCcw aria-hidden className="size-3.5" />
        Reset the sample card
      </button>
    </div>
  );
}
