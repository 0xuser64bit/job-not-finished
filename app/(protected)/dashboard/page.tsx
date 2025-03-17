import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/signin");
  }
  
  // Get the GitHub username from the session
  const githubUsername = session.user.githubUsername || session.user.name || "user-64bit";
  // Pass the username as a prop to the client component
  return <DashboardClient username={githubUsername} />;
}
