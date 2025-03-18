import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  // Get the GitHub username from the session
  const githubUsername =
    session.user.githubUsername || session.user.name || "user-64bit";
  // Check if the user has an email
  const user = await prisma.user.findUnique({
    where: { githubId: githubUsername },
  });

  // If no email is found, redirect to collect-email page
  if (!user?.email) {
    redirect("/collect-email");
  }

  // Pass the username as a prop to the client component
  return <DashboardClient username={githubUsername} />;
}
