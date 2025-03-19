import { Octokit } from "octokit";

export interface Repository {
  id: number;
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
  fork: boolean;
  project_reminder?: boolean;
  progress?: number; // Optional progress property for tracking project completion
}

export interface RepositoryResponse {
  public_repos: string;
  repos: Repository[];
}
interface GitHubRepoResponse {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
  fork: boolean;
}

const octokit = new Octokit({
  auth: process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN,
});

export async function fetchUserRepositories(
  username: string,
): Promise<RepositoryResponse> {
  try {
    const responseUser = await octokit.request(`GET /users/${username}`);
    const response = await octokit.request(`GET /users/${username}/repos`, {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
      per_page: 100,
    });
    return {
      public_repos: responseUser.data.public_repos as string,
      repos: response.data.map((repo: GitHubRepoResponse) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description ?? "",
        language: repo.language ?? null,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
        html_url: repo.html_url,
        fork: repo.fork,
        progress: undefined,
      })),
    };
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return {
      public_repos: "0",
      repos: [],
    };
  }
}
