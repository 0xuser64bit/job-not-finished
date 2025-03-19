"use server";

import prisma from "@/lib/prisma";

export const toggleReminder = async ({
  repo_id,
  project_reminder,
}: {
  repo_id: string;
  project_reminder: boolean;
}) => {
  await prisma.project.update({
    where: {
      id: repo_id,
    },
    data: {
      reminder: !project_reminder,
    },
  });
};
