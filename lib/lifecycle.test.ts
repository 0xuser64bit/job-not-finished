import { describe, expect, it } from "vitest";
import { actionSchema, transition, type Lifecycle } from "@/lib/lifecycle";
import { addDays } from "@/lib/projects";

const now = new Date("2026-10-15T12:00:00Z");
const shelf: Lifecycle = {
  status: "IDLE",
  progress: 20,
  activatedAt: null,
  dueAt: null,
  renewals: 0,
  shippedAt: null,
  buriedAt: null,
  epitaph: null,
};
const onLoan = transition(shelf, { type: "checkout" }, now)!;

describe("transition", () => {
  it("checks out with a 30-day loan and keeps progress", () => {
    expect(onLoan).toMatchObject({ status: "ACTIVE", progress: 20, activatedAt: now, renewals: 0 });
    expect(onLoan.dueAt).toEqual(addDays(now, 30));
  });

  it("renews from the due date, or from today when already overdue", () => {
    expect(transition(onLoan, { type: "renew" }, now)?.dueAt).toEqual(addDays(now, 44));
    const overdue = { ...onLoan, dueAt: addDays(now, -10) };
    expect(transition(overdue, { type: "renew" }, now)).toMatchObject({
      dueAt: addDays(now, 14),
      renewals: 1,
    });
  });

  it("rejects moves that make no sense from the current status", () => {
    const returned = transition(onLoan, { type: "return" }, now)!;
    expect(transition(returned, { type: "renew" }, now)).toBeNull();
    expect(transition(returned, { type: "progress", value: 50 }, now)).toBeNull();
    expect(transition(onLoan, { type: "checkout" }, now)).toBeNull();
    expect(transition(shelf, { type: "restore" }, now)).toBeNull();
  });

  it("round-trips return/reopen and withdraw/restore", () => {
    const returned = transition(onLoan, { type: "return" }, now)!;
    expect(returned).toMatchObject({ status: "SHIPPED", shippedAt: now });
    expect(transition(returned, { type: "reopen" }, now)).toMatchObject({
      status: "ACTIVE",
      shippedAt: null,
    });

    const buried = transition(shelf, { type: "withdraw", epitaph: "  scope creep  " }, now)!;
    expect(buried).toMatchObject({ status: "BURIED", buriedAt: now, epitaph: "scope creep" });
    expect(transition(buried, { type: "restore" }, now)).toMatchObject({
      status: "IDLE",
      epitaph: null,
    });
  });

  it("trims epitaphs and ignores empty ones", () => {
    const long = transition(shelf, { type: "withdraw", epitaph: "x".repeat(200) }, now)!;
    expect(long.epitaph).toHaveLength(140);
    expect(transition(shelf, { type: "withdraw", epitaph: "   " }, now)?.epitaph).toBeNull();
  });

  it("sets due dates to the end of the chosen day and refuses absurd ones", () => {
    expect(transition(onLoan, { type: "due", date: "2026-10-30" }, now)?.dueAt?.toISOString()).toBe(
      "2026-10-30T23:59:59.999Z",
    );
    expect(transition(onLoan, { type: "due", date: "2040-01-01" }, now)).toBeNull();
  });
});

describe("actionSchema", () => {
  it("rejects malformed input from the client", () => {
    expect(actionSchema.safeParse({ type: "progress", value: 101 }).success).toBe(false);
    expect(actionSchema.safeParse({ type: "progress", value: 50.5 }).success).toBe(false);
    expect(actionSchema.safeParse({ type: "due", date: "next tuesday" }).success).toBe(false);
    expect(actionSchema.safeParse({ type: "delete" }).success).toBe(false);
    expect(actionSchema.safeParse({ type: "renew" }).success).toBe(true);
  });
});
