import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const username = session?.user?.githubUsername || session?.user?.name || session?.user?.email || "User";

  return (
    <div className="grid container mx-auto sm:pt-10 grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Job Not Finished</h1>
        <div>
          {!isLoggedIn &&(
            <Link href="/signin">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <div className="text-center max-w-2xl">
          <h2 className="text-4xl font-bold mb-4">
            Welcome to Job Not Finished
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            A task management application with GitHub authentication
          </p>

          <div className="mb-8">
            {isLoggedIn && session.user ? (
              <div className="flex flex-col items-center">
                <p className="text-green-600 font-medium mb-4">
                  You are signed in as {username}
                </p>
                <div className="flex gap-4">
                  <Link href="/dashboard">
                    <Button>Go to Dashboard</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <Link href="/signin">
                  <Button size="lg" className="cursor-pointer">
                    Sign In with GitHub
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
