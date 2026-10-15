"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { loanFields } from "@/lib/lifecycle";
import { requireUser } from "@/lib/session";

/** Checks out whatever was ticked (possibly nothing) and finishes onboarding. */
export async function finishWelcome(formData: FormData) {
  const user = await requireUser();
  const ids = formData
    .getAll("project")
    .filter((v): v is string => typeof v === "string")
    .slice(0, 100);
  const now = new Date();

  await db.$transaction([
    db.project.updateMany({
      where: { userId: user.id, id: { in: ids }, status: "IDLE" },
      data: loanFields(now),
    }),
    db.user.update({ where: { id: user.id }, data: { onboardedAt: now } }),
  ]);
  redirect(ids.length ? "/dashboard?tab=loan" : "/dashboard?tab=shelf");
}
