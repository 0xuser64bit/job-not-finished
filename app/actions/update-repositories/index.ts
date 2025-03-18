"use server";

import { fetchUserRepositories } from "@/lib/github";
import { prisma } from "@/lib/prisma";

export const UpdateRepositoriesAction = async ({
  username,
}: {
  username: string;
}) => {
  const reposGithub = await fetchUserRepositories(username);
  const reposDB = await prisma.project.findMany({
    where: {
      userId: username,
    },
  });
  const diffRepos = reposGithub.repos.filter(
    (repo) => !reposDB.find((dbRepo) => dbRepo.id === repo.id.toString()),
  );
  await prisma.project.createMany({
    data: diffRepos.map((repo) => ({
      id: repo.id.toString(),
      name: repo.name,
      userId: username,
      progress: 0,
    })),
  });
  const allRepos = reposGithub.repos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    language: repo.language,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    updated_at: repo.updated_at,
    html_url: repo.html_url,
    fork: repo.fork,
    userId: username,
    progress: reposDB.find((dbRepo) => dbRepo.id === repo.id.toString())
      ?.progress,
  }));
  return {
    public_repos: reposGithub.public_repos,
    repos: allRepos,
  };
};

