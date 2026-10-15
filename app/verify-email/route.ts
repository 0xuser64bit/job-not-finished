import { confirmEmailChange } from "@/lib/email-change";
import { appUrl } from "@/lib/env";

/** Landing for the "send notices here" link. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const ok = await confirmEmailChange(
    url.searchParams.get("u") ?? "",
    url.searchParams.get("token") ?? "",
  );
  return Response.redirect(new URL(`/settings?email=${ok ? "confirmed" : "expired"}`, appUrl), 303);
}
