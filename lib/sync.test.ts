import { afterEach, describe, expect, it, vi } from "vitest";
import {
  diffRepos,
  fetchOwnedPublicRepos,
  GitHubError,
  toRepo,
  type StoredRepo,
} from "@/lib/github";
import { fromLegacy } from "@/lib/legacy";

const payload = (id: number, extra: object = {}) => ({
  id,
  name: `repo-${id}`,
  full_name: `octocat/repo-${id}`,
  description: "  ",
  language: "TypeScript",
  html_url: `https://github.com/octocat/repo-${id}`,
  homepage: "",
  stargazers_count: 1,
  forks_count: 0,
  open_issues_count: 0,
  fork: false,
  archived: false,
  private: false,
  created_at: "2024-01-01T00:00:00Z",
  pushed_at: "2024-06-01T00:00:00Z",
  ...extra,
});

const stored = (id: number, extra: Partial<StoredRepo> = {}): StoredRepo => ({
  id: `row-${id}`,
  ...toRepo(payload(id)),
  ...extra,
});

describe("toRepo", () => {
  it("normalises blank strings to null", () => {
    const r = toRepo(payload(1));
    expect(r).toMatchObject({ repoId: "1", description: null, homepage: null });
    expect(r.pushedAt?.toISOString()).toBe("2024-06-01T00:00:00.000Z");
  });
});

describe("diffRepos", () => {
  it("creates new, updates only changed fields, and removes vanished repos", () => {
    const fetched = [
      toRepo(payload(1)),
      toRepo(payload(2, { stargazers_count: 9, pushed_at: "2026-10-01T00:00:00Z" })),
      toRepo(payload(4)),
    ];
    const { create, update, remove } = diffRepos([stored(1), stored(2), stored(3)], fetched);
    expect(create.map((r) => r.repoId)).toEqual(["4"]);
    expect(update).toEqual([
      { id: "row-2", data: { stars: 9, pushedAt: new Date("2026-10-01T00:00:00Z") } },
    ]);
    expect(remove).toEqual(["row-3"]);
  });

  it("treats equal dates in different objects as unchanged", () => {
    const row = stored(1, { pushedAt: new Date("2024-06-01T00:00:00Z") });
    expect(diffRepos([row], [toRepo(payload(1))]).update).toEqual([]);
  });
});

describe("fetchOwnedPublicRepos", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("follows pages until a short one and drops private repos", async () => {
    const pages = [
      Array.from({ length: 100 }, (_, i) => payload(i + 1)),
      [payload(101), payload(102, { private: true })],
    ];
    const fetch = vi.fn(async () => Response.json(pages.shift()));
    vi.stubGlobal("fetch", fetch);
    const repos = await fetchOwnedPublicRepos("token");
    expect(repos).toHaveLength(101);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("reports rate limits with a retry hint instead of returning partial data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("{}", {
            status: 403,
            headers: { "x-ratelimit-remaining": "0", "retry-after": "42" },
          }),
      ),
    );
    await expect(fetchOwnedPublicRepos("token")).rejects.toMatchObject({
      status: 429,
      retryAfter: 42,
    });
    await expect(fetchOwnedPublicRepos("token")).rejects.toBeInstanceOf(GitHubError);
  });
});

describe("fromLegacy", () => {
  const now = new Date("2026-10-15T00:00:00Z");
  const row = {
    progress: 0,
    reminder: false,
    createdAt: new Date("2025-03-18"),
    updatedAt: new Date("2025-04-01"),
  };

  it("maps v1 progress and reminders onto the lifecycle", () => {
    expect(fromLegacy({ ...row, progress: 100 }, now)).toMatchObject({
      status: "SHIPPED",
      progress: 100,
    });
    expect(fromLegacy({ ...row, reminder: true }, now)).toMatchObject({
      status: "ACTIVE",
      progress: 0,
    });
    expect(fromLegacy({ ...row, progress: 40 }, now)?.dueAt?.toISOString()).toBe(
      "2026-11-14T00:00:00.000Z",
    );
    expect(fromLegacy(row, now)).toBeNull();
  });
});
