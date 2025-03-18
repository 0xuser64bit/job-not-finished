"use server";

import prisma from "@/lib/prisma";

export const updateProgress = async ({
  repo_id,
  newProgressValue,
}: {
  repo_id: string;
  newProgressValue: number;
}) => {
  await prisma.project.update({
    where: {
      id: repo_id,
    },
    data: {
      progress: newProgressValue,
    },
  });
};
