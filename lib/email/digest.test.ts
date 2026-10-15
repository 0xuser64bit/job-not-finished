import { describe, expect, it } from "vitest";
import { composeDigest, digestSubject, type DigestProject } from "@/lib/email/digest";
import { escapeHtml, html } from "@/lib/email/html";
import { addDays } from "@/lib/projects";
import { hashToken, oneTimeToken, sign, verify } from "@/lib/tokens";

const now = new Date("2026-10-18T00:00:00Z");
const project = (over: Partial<DigestProject>): DigestProject => ({
  id: "p",
  name: "todo-app-v3",
  status: "ACTIVE",
  progress: 40,
  pushedAt: addDays(now, -3),
  dueAt: addDays(now, 10),
  renewals: 0,
  openIssues: 0,
  htmlUrl: "https://github.com/octocat/todo-app-v3",
  ...over,
});

describe("html", () => {
  it("escapes interpolations but not nested html", () => {
    const evil = `<img src=x onerror="alert(1)">`;
    const nested = html`<b>ok</b>`;
    const out = html`<p>${evil}</p>
      ${nested}`.value;
    expect(out).toContain(`<p>${escapeHtml(evil)}</p>`);
    expect(out).toContain("<b>ok</b>");
    expect(out).not.toContain("<img");
  });
});

describe("digestSubject", () => {
  it("leads with the most overdue project", () => {
    expect(digestSubject([project({ dueAt: addDays(now, -31) })], now)).toBe(
      "Overdue notice: todo-app-v3 is 31 days late",
    );
    expect(
      digestSubject(
        [project({ dueAt: addDays(now, -2) }), project({ dueAt: addDays(now, -9) })],
        now,
      ),
    ).toBe("Overdue notice: 2 projects are past due");
  });

  it("falls back to staleness, then encouragement", () => {
    expect(digestSubject([project({ pushedAt: addDays(now, -41) })], now)).toBe(
      "Weekly notice: todo-app-v3 hasn't moved in 41 days",
    );
    expect(digestSubject([project({})], now)).toBe("Weekly notice: 1 project on loan. Keep going.");
  });
});

describe("composeDigest", () => {
  const email = composeDigest({
    to: "dev@example.com",
    login: "octo<cat>",
    projects: [
      project({ name: "a&b", dueAt: addDays(now, -5) }),
      project({ id: "q", name: "fresh" }),
    ],
    now,
    appUrl: "https://jnf.example",
    unsubscribe: {
      page: "https://jnf.example/unsubscribe?u=1&t=sig",
      oneClick: "https://jnf.example/api/unsubscribe?u=1&t=sig",
    },
  });

  it("escapes user-controlled text", () => {
    expect(email.html).toContain("@octo&lt;cat&gt;");
    expect(email.html).toContain("a&amp;b");
    expect(email.html).not.toContain("octo<cat>");
  });

  it("puts overdue projects first and supports one-click unsubscribe", () => {
    expect(email.text.indexOf("a&b")).toBeLessThan(email.text.indexOf("fresh"));
    expect(email.headers).toEqual({
      "List-Unsubscribe": "<https://jnf.example/api/unsubscribe?u=1&t=sig>",
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    });
    expect(email.html).toContain("https://jnf.example/unsubscribe?u=1&amp;t=sig");
  });
});

describe("tokens", () => {
  it("verifies its own signatures and nothing else", () => {
    const sig = sign("unsubscribe", "user-1");
    expect(verify("unsubscribe", "user-1", sig)).toBe(true);
    expect(verify("unsubscribe", "user-2", sig)).toBe(false);
    expect(verify("unsubscribe", "user-1", sig.slice(0, -1))).toBe(false);
    expect(verify("unsubscribe", "user-1", "")).toBe(false);
  });

  it("stores only the hash of one-time tokens", () => {
    const { token, hash } = oneTimeToken();
    expect(hash).toBe(hashToken(token));
    expect(hash).not.toContain(token);
  });
});
