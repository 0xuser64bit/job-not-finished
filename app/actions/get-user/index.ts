"use server";

import prisma from "@/lib/prisma";

export const getUser = async ({ username }: { username: string }) => {
  return await prisma.user.findFirst({
    where: { githubId: username },
  });
};
