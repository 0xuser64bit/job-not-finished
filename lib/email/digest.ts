import { html } from "@/lib/email/html";
import type { Email } from "@/lib/email/send";
import { daysOverdue, daysSince, stampDate } from "@/lib/projects";
import { roast, type RoastInput } from "@/lib/roast";

export type DigestProject = RoastInput & { htmlUrl: string };

type DigestInput = {
  to: string;
  login: string | null;
  projects: DigestProject[];
  now: Date;
  appUrl: string;
  /** Confirm page for the body link; one-click POST target for the header. */
  unsubscribe: { page: string; oneClick: string };
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function digestSubject(projects: DigestProject[], now: Date) {
  const overdue = projects
    .map((p) => ({ p, late: daysOverdue(p, now) }))
    .filter((x) => x.late > 0)
    .sort((a, b) => b.late - a.late);
  if (overdue.length === 1) {
    return `Overdue notice: ${overdue[0].p.name} is ${plural(overdue[0].late, "day")} late`;
  }
  if (overdue.length > 1) return `Overdue notice: ${overdue.length} projects are past due`;

  const stalest = projects
    .map((p) => ({ p, days: daysSince(p.pushedAt, now) }))
    .filter((x): x is { p: DigestProject; days: number } => x.days !== null && x.days > 14)
    .sort((a, b) => b.days - a.days)[0];
  if (stalest) return `Weekly notice: ${stalest.p.name} hasn't moved in ${stalest.days} days`;

  return `Weekly notice: ${plural(projects.length, "project")} on loan. Keep going.`;
}

/** Overdue first, then the longest untouched. */
const order = (now: Date) => (a: DigestProject, b: DigestProject) =>
  daysOverdue(b, now) - daysOverdue(a, now) ||
  (daysSince(b.pushedAt, now) ?? Infinity) - (daysSince(a.pushedAt, now) ?? Infinity);

function facts(p: DigestProject, now: Date) {
  const late = daysOverdue(p, now);
  const pushed = daysSince(p.pushedAt, now);
  return [
    p.dueAt
      ? `DUE ${stampDate(p.dueAt)}${late ? ` (${plural(late, "day")} late)` : ""}`
      : "NO DUE DATE",
    pushed === null
      ? "NEVER PUSHED"
      : `LAST PUSH ${pushed === 0 ? "TODAY" : `${plural(pushed, "day")} ago`.toUpperCase()}`,
    `${p.progress}% DONE`,
  ].join(" · ");
}

export function composeDigest({
  to,
  login,
  projects,
  now,
  appUrl,
  unsubscribe,
}: DigestInput): Email {
  const sorted = [...projects].sort(order(now));
  const anyOverdue = sorted.some((p) => daysOverdue(p, now) > 0);
  const title = anyOverdue ? "OVERDUE NOTICE" : "WEEKLY NOTICE";
  const borrower = login ? `@${login}` : "you";
  const date = stampDate(now);
  const catalogUrl = `${appUrl}/dashboard`;
  const lines = sorted.map((p) => ({ p, facts: facts(p, now), roast: roast(p, now) }));

  const mono = "'Courier New', Courier, monospace";
  const body = html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <title>${title}</title>
      </head>
      <body style="margin:0;padding:0;background:#1c4a3a;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
          ${lines[0]?.roast ?? ""}
        </div>
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="background:#1c4a3a;"
        >
          <tr>
            <td align="center" style="padding:32px 12px;">
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="max-width:600px;background:#f6cdd2;color:#1c1a15;font-family:${mono};font-size:14px;line-height:22px;"
              >
                <tr>
                  <td style="padding:28px 32px 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:${mono};font-size:12px;color:#51493a;">
                          JOB NOT FINISHED / CIRCULATION DESK
                        </td>
                        <td align="right" style="font-family:${mono};font-size:12px;color:#51493a;">
                          ${date}
                        </td>
                      </tr>
                    </table>
                    <p
                      style="margin:24px 0 8px;text-align:center;font-size:22px;font-weight:bold;letter-spacing:6px;"
                    >
                      ${title}
                    </p>
                    <p style="margin:16px 0 0;">Borrower: ${borrower}</p>
                    <p style="margin:4px 0 16px;">
                      Our records show the following projects checked out in your name:
                    </p>
                  </td>
                </tr>
                ${lines.map(
                  ({ p, facts, roast }) =>
                    html`<tr>
                      <td style="padding:0 32px;">
                        <table
                          role="presentation"
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                          style="border-top:1px dashed #8a6f72;"
                        >
                          <tr>
                            <td style="padding:12px 0;font-family:${mono};">
                              <a
                                href="${p.htmlUrl}"
                                style="color:#1c1a15;font-weight:bold;text-decoration:none;"
                                >${p.name}</a
                              ><br />
                              <span style="font-size:12px;color:#51493a;">${facts}</span><br />
                              <em>${roast}</em>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>`,
                )}
                <tr>
                  <td style="padding:8px 32px 28px;">
                    <p style="margin:0 0 20px;border-top:1px dashed #8a6f72;padding-top:16px;">
                      Return them, renew them, or withdraw them. The desk is open all week.
                    </p>
                    <a
                      href="${catalogUrl}"
                      style="display:inline-block;background:#1c1a15;color:#f5e9cd;font-family:${mono};font-weight:bold;letter-spacing:2px;text-decoration:none;padding:12px 20px;"
                      >OPEN YOUR CATALOG</a
                    >
                    <p style="margin:28px 0 0;font-size:12px;line-height:18px;color:#51493a;">
                      You get this because you checked these projects out on Job Not Finished.
                      <a href="${unsubscribe.page}" style="color:#51493a;"
                        >Unsubscribe in one click</a
                      >, or change your notices in
                      <a href="${appUrl}/settings" style="color:#51493a;">settings</a>. No hard
                      feelings.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  const text = [
    `JOB NOT FINISHED / CIRCULATION DESK          ${date}`,
    "",
    title,
    "",
    `Borrower: ${borrower}`,
    "Our records show the following projects checked out in your name:",
    "",
    ...lines.flatMap(({ p, facts, roast }) => [p.name, facts, roast, p.htmlUrl, ""]),
    "Return them, renew them, or withdraw them:",
    catalogUrl,
    "",
    `Unsubscribe in one click: ${unsubscribe.page}`,
  ].join("\n");

  return {
    to,
    subject: digestSubject(sorted, now),
    html: body.value,
    text,
    headers: {
      "List-Unsubscribe": `<${unsubscribe.oneClick}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
