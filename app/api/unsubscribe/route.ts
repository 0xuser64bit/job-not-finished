import { db } from "@/lib/db";
import { verify } from "@/lib/tokens";

/**
 * RFC 8058 one-click unsubscribe: mail clients POST here straight from the
 * List-Unsubscribe header. The signature is the only credential.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("u") ?? "";
  const signature = url.searchParams.get("t") ?? "";
  if (!userId || !verify("unsubscribe", userId, signature)) {
    return Response.json({ error: "Invalid unsubscribe link" }, { status: 400 });
  }
  await db.user.updateMany({ where: { id: userId }, data: { digestEnabled: false } });
  return new Response(null, { status: 204 });
}
