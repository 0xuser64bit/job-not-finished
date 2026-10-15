import type { ProjectStatus } from "@/lib/generated/prisma/enums";
import { addDays } from "@/lib/projects";

/**
 * Illustrative projects for the marketing page. Dates are relative to `now`,
 * so the numbers in the copy stay true whenever the page renders.
 */
export type DemoProject = {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
  status: ProjectStatus;
  progress: number;
  renewals: number;
  pushedAt: Date | null;
  dueAt: Date | null;
};

export function demoProjects(now: Date): DemoProject[] {
  const p = (days: number) => addDays(now, -days);
  return [
    {
      id: "demo-raytracer",
      name: "weekend-raytracer",
      description: "Ray tracing in one weekend. It has been nine weekends.",
      language: "Rust",
      stars: 14,
      forks: 1,
      openIssues: 2,
      status: "ACTIVE",
      progress: 88,
      renewals: 1,
      pushedAt: p(9),
      dueAt: addDays(now, 4),
    },
    {
      id: "demo-todo",
      name: "todo-app-v3",
      description: "The last todo app I will ever write. Probably.",
      language: "TypeScript",
      stars: 3,
      forks: 0,
      openIssues: 0,
      status: "ACTIVE",
      progress: 35,
      renewals: 0,
      pushedAt: p(214),
      dueAt: p(31),
    },
    {
      id: "demo-portfolio",
      name: "portfolio-2025",
      description: "Personal site, now with a blog I'll never post to.",
      language: "Astro",
      stars: 0,
      forks: 0,
      openIssues: 1,
      status: "ACTIVE",
      progress: 60,
      renewals: 0,
      pushedAt: p(41),
      dueAt: p(12),
    },
  ];
}

/** Push dates on the hero slip: the gaps widen, then stop. */
export const SLIP_PUSHES = [
  "2024-03-14",
  "2024-04-02",
  "2024-04-29",
  "2024-06-19",
  "2024-08-03",
].map((d) => new Date(`${d}T12:00:00Z`));
