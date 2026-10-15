"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUser } from "@/lib/session";

export async function signIn() {
  if (await getUser()) redirect("/dashboard");
  const { url } = await auth.api.signInSocial({
    body: {
      provider: "github",
      callbackURL: "/dashboard",
      newUserCallbackURL: "/welcome",
      errorCallbackURL: "/sign-in",
      disableRedirect: true,
    },
    headers: await headers(),
  });
  if (!url) throw new Error("GitHub sign-in is not configured");
  redirect(url);
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
