import "server-only";
import { appUrl } from "@/lib/env";
import { sign } from "@/lib/tokens";

const query = (userId: string) =>
  `u=${encodeURIComponent(userId)}&t=${sign("unsubscribe", userId)}`;

/** The confirm page linked from the email body. */
export const unsubscribePageUrl = (userId: string) => `${appUrl}/unsubscribe?${query(userId)}`;

/** RFC 8058 one-click target for the List-Unsubscribe header. */
export const unsubscribePostUrl = (userId: string) => `${appUrl}/api/unsubscribe?${query(userId)}`;
