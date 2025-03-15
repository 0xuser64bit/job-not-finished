import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  
  // If the user is not logged in, redirect to the sign-in page
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              Signed in as: <span className="font-medium">{session.user.name || session.user.email}</span>
            </div>
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}>
              <Button 
                type="submit"
                variant="outline"
                className="ml-4"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="h-96 rounded-lg border-4 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold mb-4">Protected Dashboard Page</h2>
              <p className="text-gray-600 mb-6">This page is only accessible to authenticated users.</p>
              <div className="flex gap-4">
                <Link href="/profile">
                  <Button>
                    Go to Profile
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 