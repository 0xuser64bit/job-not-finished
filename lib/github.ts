import axios from "axios";

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
  progress?: number; // Optional progress property for tracking project completion
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

export async function fetchUserRepositories(
  username: string,
): Promise<Repository[]> {
  try {
    const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    // Add authorization header only if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(
      `https://api.github.com/users/${username}/repos`,
      {
        headers,
      },
    );
    return response.data.map((repo: GitHubRepoResponse) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description ?? "",
      language: repo.language ?? null,
      stargazers_count: repo.stargazers_count ?? 0,
      forks_count: repo.forks_count ?? 0,
      updated_at: repo.updated_at ?? new Date().toISOString(),
      html_url: repo.html_url,
      fork: repo.fork,
      progress: undefined, // No progress from GitHub API, will be set elsewhere
    }));
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return [];
  }
}
