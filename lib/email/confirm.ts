import { html } from "@/lib/email/html";
import type { Email } from "@/lib/email/send";

/** "Is this really your address?" for a new notice destination. */
export function confirmEmail(to: string, url: string): Email {
  const mono = "'Courier New', Courier, monospace";
  const body = html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="color-scheme" content="light" />
        <title>Confirm your address</title>
      </head>
      <body style="margin:0;padding:0;background:#1c4a3a;">
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
                style="max-width:560px;background:#f5e9cd;color:#1c1a15;font-family:${mono};font-size:14px;line-height:22px;"
              >
                <tr>
                  <td style="padding:28px 32px;">
                    <p style="margin:0;font-size:12px;color:#51493a;">
                      JOB NOT FINISHED / CIRCULATION DESK
                    </p>
                    <p
                      style="margin:24px 0 8px;font-size:20px;font-weight:bold;letter-spacing:4px;"
                    >
                      CONFIRM YOUR ADDRESS
                    </p>
                    <p style="margin:16px 0;">
                      Someone (hopefully you) asked for weekly overdue notices to be sent to ${to}.
                    </p>
                    <a
                      href="${url}"
                      style="display:inline-block;background:#1c1a15;color:#f5e9cd;font-weight:bold;letter-spacing:2px;text-decoration:none;padding:12px 20px;"
                      >SEND NOTICES HERE</a
                    >
                    <p style="margin:24px 0 0;font-size:12px;line-height:18px;color:#51493a;">
                      The link expires in 24 hours. If you didn't ask for this, ignore it and
                      nothing changes.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;
  return {
    to,
    subject: "Confirm where your overdue notices go",
    html: body.value,
    text: `Someone (hopefully you) asked for weekly overdue notices from Job Not Finished to be sent to ${to}.\n\nConfirm: ${url}\n\nThe link expires in 24 hours. If you didn't ask for this, ignore it.`,
  };
}
