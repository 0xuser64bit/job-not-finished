import { z } from "zod";
import type { ProjectStatus } from "@/lib/generated/prisma/enums";
import { addDays, LOAN_DAYS, RENEW_DAYS } from "@/lib/projects";

/** The user-owned half of a project. */
export type Lifecycle = {
  status: ProjectStatus;
  progress: number;
  activatedAt: Date | null;
  dueAt: Date | null;
  renewals: number;
  shippedAt: Date | null;
  buriedAt: Date | null;
  epitaph: string | null;
};

export const EPITAPH_MAX = 140;

export const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("checkout") }),
  z.object({ type: z.literal("renew") }),
  z.object({ type: z.literal("return") }),
  z.object({ type: z.literal("withdraw"), epitaph: z.string().max(EPITAPH_MAX * 2) }),
  z.object({ type: z.literal("reopen") }),
  z.object({ type: z.literal("restore") }),
  z.object({ type: z.literal("progress"), value: z.number().int().min(0).max(100) }),
  z.object({ type: z.literal("due"), date: z.iso.date() }),
]);

export type CardAction = z.infer<typeof actionSchema>;

/** What checking a project out writes. */
export const loanFields = (now: Date) => ({
  status: "ACTIVE" as const,
  activatedAt: now,
  dueAt: addDays(now, LOAN_DAYS),
  renewals: 0,
});

/**
 * Every lifecycle change in the app goes through here: the server actions,
 * the optimistic UI, and the marketing demo. Returns null for a move that
 * isn't allowed from the current status.
 */
export function transition(p: Lifecycle, action: CardAction, now: Date): Lifecycle | null {
  const loan = loanFields(now);
  switch (action.type) {
    case "checkout":
      return p.status === "IDLE" ? { ...p, ...loan } : null;
    case "renew":
      if (p.status !== "ACTIVE") return null;
      // Renewing an overdue project starts the clock from today, not the old due date.
      return {
        ...p,
        dueAt: addDays(p.dueAt && p.dueAt > now ? p.dueAt : now, RENEW_DAYS),
        renewals: p.renewals + 1,
      };
    case "return":
      // Shelf projects can be returned too: "I already finished that one."
      return p.status === "ACTIVE" || p.status === "IDLE"
        ? { ...p, status: "SHIPPED", shippedAt: now }
        : null;
    case "withdraw": {
      if (p.status !== "ACTIVE" && p.status !== "IDLE") return null;
      const epitaph = action.epitaph.trim().slice(0, EPITAPH_MAX) || null;
      return { ...p, status: "BURIED", buriedAt: now, epitaph };
    }
    case "reopen":
      return p.status === "SHIPPED" ? { ...p, ...loan, shippedAt: null } : null;
    case "restore":
      return p.status === "BURIED" ? { ...p, status: "IDLE", buriedAt: null, epitaph: null } : null;
    case "progress":
      return p.status === "ACTIVE" ? { ...p, progress: action.value } : null;
    case "due": {
      if (p.status !== "ACTIVE") return null;
      // End of the chosen day, UTC, so "due Oct 30" holds all of Oct 30.
      const due = new Date(`${action.date}T23:59:59.999Z`);
      if (due.getTime() > addDays(now, 3650).getTime()) return null;
      return { ...p, dueAt: due };
    }
  }
}
