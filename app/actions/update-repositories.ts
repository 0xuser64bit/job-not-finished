"use server";

import { fetchUserRepositories } from "@/lib/github";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function UpdateRepositoriesAction({
  username,
}: {
  username: string;
}) {
  try {
    const session = await auth();
    const { public_repos, repos } = await fetchUserRepositories(username);

    // If user is authenticated, fetch progress and reminder values from the database
    if (session?.user?.githubUsername) {
      const userId = session.user.githubUsername;
      const dbProjects = await prisma.project.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
          progress: true,
          reminder: true,
        },
      });

      // Create a map for efficient lookup
      const projectMap = new Map(
        dbProjects.map((project) => [project.id, project]),
      );

      // Merge GitHub repositories with database information
      const mergedRepos = repos.map((repo) => {
        const dbProject = projectMap.get(repo.id.toString());
        return {
          ...repo,
          progress: dbProject?.progress || 0,
          project_reminder: dbProject?.reminder || false,
        };
      });

      // Create database entries for repositories that don't exist yet
      const repoIds = repos.map((repo) => repo.id.toString());
      const existingIds = dbProjects.map((project) => project.id);
      const newRepoIds = repoIds.filter((id) => !existingIds.includes(id));

      if (newRepoIds.length > 0 && userId) {
        const newRepos = repos.filter((repo) =>
          newRepoIds.includes(repo.id.toString()),
        );
        await prisma.project.createMany({
          data: newRepos.map((repo) => ({
            id: repo.id.toString(),
            name: repo.name,
            progress: 0,
            reminder: false,
            userId,
          })),
          skipDuplicates: true,
        });
      }

      return { public_repos, repos: mergedRepos };
    }

    return { public_repos, repos };
  } catch (error) {
    console.error("Error updating repositories:", error);
    throw error;
  }
}
