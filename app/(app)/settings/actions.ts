"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deliverable } from "@/lib/digest";
import { startEmailChange } from "@/lib/email-change";
import { requireUser } from "@/lib/session";
import { revokeGitHubAccess } from "@/lib/sync";

export type FormState = { ok?: string; error?: string };

export async function setDigest(formData: FormData) {
  const user = await requireUser();
  await db.user.update({
    where: { id: user.id },
    data: { digestEnabled: formData.get("on") === "1" },
  });
  revalidatePath("/settings");
}

export async function setPublicRecord(formData: FormData) {
  const user = await requireUser();
  await db.user.update({
    where: { id: user.id },
    data: { publicProfile: formData.get("on") === "1" },
  });
  revalidatePath("/settings");
  if (user.githubLogin) revalidatePath(`/u/${user.githubLogin}`);
}

/** Starts an address change: nothing is sent to a new address until it clicks a link. */
export async function requestDigestEmail(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = z
    .email()
    .max(254)
    .safeParse(
      String(formData.get("email") ?? "")
        .trim()
        .toLowerCase(),
    );
  if (!parsed.success) return { error: "That doesn't look like an email address." };
  const email = parsed.data;
  if (!deliverable(email)) return { error: "GitHub's noreply addresses can't receive mail." };

  const current = user.digestEmail ?? (user.emailVerified ? user.email : null);
  if (email === current) return { error: "Notices already go there." };
  if (email === user.email && user.emailVerified) {
    // GitHub already verified this one.
    await db.user.update({ where: { id: user.id }, data: { digestEmail: null } });
    revalidatePath("/settings");
    return { ok: `Notices go to ${email} again.` };
  }

  try {
    if (!(await startEmailChange(user.id, email))) {
      return { error: "A link just went out. Give it a minute before asking again." };
    }
  } catch (err) {
    console.error("[settings] confirmation email failed:", err);
    return { error: "Couldn't send the confirmation email. Try again shortly." };
  }
  revalidatePath("/settings");
  return { ok: `Check ${email} for a confirmation link. It expires in 24 hours.` };
}

/** Deletes the user and everything that cascades from them, after typed confirmation. */
export async function closeCard(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const expected = user.githubLogin ?? "close my card";
  const typed = String(formData.get("confirm") ?? "")
    .trim()
    .replace(/^@/, "");
  if (typed.toLowerCase() !== expected.toLowerCase())
    return { error: `Type ${expected} to confirm.` };

  await revokeGitHubAccess(user.id).catch((err) =>
    console.warn("[settings] couldn't revoke the GitHub grant:", err),
  );
  await auth.api.signOut({ headers: await headers() });
  await db.user.delete({ where: { id: user.id } });
  redirect("/goodbye");
}
