import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await auth();

  // If the user is not logged in, redirect to the sign-in page
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Profile
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="h-96 rounded-lg border-4 border-dashed border-gray-200 p-8">
              <div className="flex flex-col items-center">
                {session.user.image && (
                  <div className="relative h-24 w-24 rounded-full overflow-hidden mb-4">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Profile picture"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h2 className="text-2xl font-bold">
                  {session.user.name || "User"}
                </h2>
                <p className="text-gray-600">{session.user.email}</p>

                <div className="mt-8 p-4 bg-white rounded-lg shadow w-full max-w-md">
                  <h3 className="text-lg font-medium mb-2">User Information</h3>
                  <p className="text-gray-600 mb-1">
                    This is a protected profile page that only authenticated
                    users can access.
                  </p>
                  <p className="text-gray-600">
                    You are signed in with GitHub.
                  </p>
                </div>

                <div className="mt-8 flex gap-4">
                  <Link href="/dashboard">
                    <Button>Back to Dashboard</Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline">Home</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
