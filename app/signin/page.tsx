import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";

export default async function SignInPage() {
  const session = await auth();

  // If the user is already logged in, redirect to the dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your GitHub account to continue
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <form
            className="space-y-6"
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <Button
              type="submit"
              className="group relative cursor-pointer flex w-full justify-center rounded-md border border-transparent bg-black py-2 px-4 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <GithubIcon className="mr-2 h-4 w-4" />
              Sign in with GitHub
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
