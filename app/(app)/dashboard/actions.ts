"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { actionSchema, transition } from "@/lib/lifecycle";
import { requireUser } from "@/lib/session";
import { SYNC_COOLDOWN_MS, syncErrorMessage, syncUser } from "@/lib/sync";

export type Result = { ok: true } | { ok: false; error: string };

const LIFECYCLE = {
  status: true,
  progress: true,
  activatedAt: true,
  dueAt: true,
  renewals: true,
  shippedAt: true,
  buriedAt: true,
  epitaph: true,
} as const;

/** Applies one lifecycle action to one of the signed-in user's projects. */
export async function updateProject(projectId: unknown, input: unknown): Promise<Result> {
  const user = await requireUser();
  const action = actionSchema.safeParse(input);
  if (typeof projectId !== "string" || !action.success) {
    return { ok: false, error: "That change didn't make sense. Reload and try again." };
  }
  const project = await db.project.findFirst({
    where: { id: projectId, userId: user.id },
    select: LIFECYCLE,
  });
  if (!project) return { ok: false, error: "This project left your catalog. Sync to refresh." };

  const next = transition(project, action.data, new Date());
  if (!next) return { ok: false, error: "That can't be done from its current status." };

  await db.project.updateMany({ where: { id: projectId, userId: user.id }, data: next });
  // No revalidatePath: the card refreshes the page itself, after its stamp has landed.
  return { ok: true };
}

export async function syncNow(): Promise<Result> {
  const user = await requireUser();
  if (user.syncedAt && Date.now() - user.syncedAt.getTime() < SYNC_COOLDOWN_MS) return { ok: true };
  try {
    await syncUser(user.id);
  } catch (err) {
    return { ok: false, error: syncErrorMessage(err) };
  }
  revalidatePath("/dashboard");
  return { ok: true };
}
