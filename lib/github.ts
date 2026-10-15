import "server-only";

/** A public repository the user owns, as we store it. */
export type Repo = {
  repoId: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  htmlUrl: string;
  homepage: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  isFork: boolean;
  isArchived: boolean;
  repoCreatedAt: Date;
  pushedAt: Date | null;
};

type RepoPayload = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  fork: boolean;
  archived: boolean;
  private: boolean;
  created_at: string;
  pushed_at: string | null;
};

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Seconds until the rate limit resets, when GitHub says so. */
    readonly retryAfter?: number,
  ) {
    super(message);
  }
}

const PER_PAGE = 100;
// ponytail: hard cap of 3,000 repos per user; raise if someone actually hits it.
const MAX_PAGES = 30;

export function toRepo(r: RepoPayload): Repo {
  return {
    repoId: String(r.id),
    name: r.name,
    fullName: r.full_name,
    description: r.description?.trim() || null,
    language: r.language,
    htmlUrl: r.html_url,
    homepage: r.homepage?.trim() || null,
    stars: r.stargazers_count,
    forks: r.forks_count,
    openIssues: r.open_issues_count,
    isFork: r.fork,
    isArchived: r.archived,
    repoCreatedAt: new Date(r.created_at),
    pushedAt: r.pushed_at ? new Date(r.pushed_at) : null,
  };
}

async function gh<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "job-not-finished",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (res.ok) return res.json() as Promise<T>;

  const limited = res.status === 429 || res.headers.get("x-ratelimit-remaining") === "0";
  if (limited) {
    const reset = Number(res.headers.get("x-ratelimit-reset"));
    const retryAfter =
      Number(res.headers.get("retry-after")) ||
      (reset ? Math.max(0, reset - Math.floor(Date.now() / 1000)) : undefined);
    throw new GitHubError("GitHub rate limit reached", 429, retryAfter);
  }
  if (res.status === 401) throw new GitHubError("GitHub access was revoked", 401);
  throw new GitHubError(`GitHub responded ${res.status} for ${path}`, res.status);
}

const MIRRORED = [
  "name",
  "fullName",
  "description",
  "language",
  "htmlUrl",
  "homepage",
  "stars",
  "forks",
  "openIssues",
  "isFork",
  "isArchived",
  "repoCreatedAt",
  "pushedAt",
] as const satisfies (keyof Repo)[];

export type StoredRepo = Pick<Repo, "repoId" | (typeof MIRRORED)[number]> & { id: string };

const same = (a: unknown, b: unknown) =>
  a instanceof Date && b instanceof Date ? a.getTime() === b.getTime() : a === b;

/** What a sync must write: new repos, changed mirror fields, and repos that are gone. */
export function diffRepos(stored: StoredRepo[], fetched: Repo[]) {
  const unseen = new Map(stored.map((s) => [s.repoId, s]));
  const create: Repo[] = [];
  const update: { id: string; data: Partial<Repo> }[] = [];
  for (const repo of fetched) {
    const row = unseen.get(repo.repoId);
    if (!row) {
      create.push(repo);
      continue;
    }
    unseen.delete(repo.repoId);
    const changed = MIRRORED.filter((f) => !same(row[f], repo[f]));
    if (changed.length)
      update.push({ id: row.id, data: Object.fromEntries(changed.map((f) => [f, repo[f]])) });
  }
  return { create, update, remove: [...unseen.values()].map((r) => r.id) };
}

export const mirroredSelect = Object.fromEntries(
  ["id", "repoId", ...MIRRORED].map((f) => [f, true]),
) as Record<keyof StoredRepo, true>;

export const fetchViewer = (token: string) => gh<{ id: number; login: string }>("/user", token);

/** Every public repo the token's user owns. Throws rather than returning a partial list. */
export async function fetchOwnedPublicRepos(token: string): Promise<Repo[]> {
  const repos: Repo[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await gh<RepoPayload[]>(
      `/user/repos?affiliation=owner&visibility=public&sort=pushed&per_page=${PER_PAGE}&page=${page}`,
      token,
    );
    // Belt and braces: the default scopes can't see private repos anyway.
    repos.push(...batch.filter((r) => !r.private).map(toRepo));
    if (batch.length < PER_PAGE) break;
  }
  return repos;
}
