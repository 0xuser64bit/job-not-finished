import { describe, expect, it } from "vitest";
import { addDays, standing, tally } from "@/lib/projects";
import { bucket, roast, type RoastInput } from "@/lib/roast";

const now = new Date("2026-10-15T12:00:00Z");
const base: RoastInput = {
  id: "p1",
  name: "todo-app-v3",
  status: "IDLE",
  progress: 0,
  pushedAt: now,
  dueAt: null,
  renewals: 0,
  openIssues: 0,
};
const pushed = (days: number): RoastInput => ({ ...base, pushedAt: addDays(now, -days) });

describe("standing", () => {
  it("is overdue only for checked-out projects past their due date", () => {
    expect(standing({ status: "ACTIVE", dueAt: addDays(now, -1) }, now)).toBe("overdue");
    expect(standing({ status: "ACTIVE", dueAt: addDays(now, 1) }, now)).toBe("on-loan");
    expect(standing({ status: "ACTIVE", dueAt: null }, now)).toBe("on-loan");
    expect(standing({ status: "SHIPPED", dueAt: addDays(now, -9) }, now)).toBe("returned");
  });
});

describe("tally", () => {
  it("ignores forks and counts dormant unfinished repos", () => {
    const repo = { dueAt: null, repoCreatedAt: addDays(now, -400), isFork: false };
    const t = tally(
      [
        { ...repo, status: "IDLE", pushedAt: addDays(now, -200) },
        { ...repo, status: "IDLE", pushedAt: addDays(now, -2) },
        { ...repo, status: "ACTIVE", pushedAt: null, dueAt: addDays(now, -1) },
        { ...repo, status: "SHIPPED", pushedAt: addDays(now, -300) },
        { ...repo, status: "IDLE", pushedAt: addDays(now, -300), isFork: true },
      ],
      now,
    );
    expect(t).toMatchObject({ repos: 4, shelf: 2, overdue: 1, returned: 1, unfinished: 3, dormant: 2 });
  });
});

describe("roast", () => {
  it("buckets by activity at the boundaries", () => {
    expect(bucket(pushed(3), now)).toBe("fresh");
    expect(bucket(pushed(4), now)).toBe("warm");
    expect(bucket(pushed(15), now)).toBe("stalling");
    expect(bucket(pushed(31), now)).toBe("cold");
    expect(bucket(pushed(91), now)).toBe("fossil");
    expect(bucket(pushed(366), now)).toBe("ancient");
    expect(bucket({ ...base, pushedAt: null }, now)).toBe("never");
  });

  it("lets commitments outrank activity", () => {
    const active = { ...pushed(200), status: "ACTIVE" as const };
    expect(bucket({ ...active, status: "SHIPPED" }, now)).toBe("returned");
    expect(bucket({ ...active, renewals: 3, dueAt: addDays(now, -5) }, now)).toBe("renewed");
    expect(bucket({ ...active, dueAt: addDays(now, -5) }, now)).toBe("overdue");
    expect(bucket({ ...active, progress: 90 }, now)).toBe("almost");
    // Shelf projects aren't nagged about progress they never committed to.
    expect(bucket({ ...pushed(200), progress: 90 }, now)).toBe("fossil");
  });

  it("is stable within a week and fills every template", () => {
    const inputs: RoastInput[] = [
      { ...base, status: "SHIPPED" },
      { ...base, status: "BURIED" },
      { ...pushed(10), status: "ACTIVE", renewals: 4 },
      { ...pushed(10), status: "ACTIVE", dueAt: addDays(now, -1) },
      { ...pushed(1), status: "ACTIVE", progress: 95 },
      { ...pushed(60), openIssues: 12 },
      { ...base, pushedAt: null },
      ...[0, 1, 9, 20, 60, 200, 800].map(pushed),
    ];
    for (const input of inputs) {
      for (let i = 0; i < 40; i++) {
        const line = roast({ ...input, id: `p${i}` }, now);
        expect(line).not.toMatch(/undefined|NaN|\{|\}/);
        expect(line).not.toMatch(/\b1 days\b/);
      }
      expect(roast(input, now)).toBe(roast(input, addDays(now, 0.1)));
    }
  });
});
