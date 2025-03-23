import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github } from "lucide-react";
import { motion } from "framer-motion";

export const RepNotFoundError = ({ error }: { error: string }) => {
  return (
    <div className="p-8 flex flex-col justify-center items-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/10">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Github size={24} />
              GitHub Connection Error
            </CardTitle>
            <CardDescription className="text-red-500">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">
                Troubleshooting:
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-amber-800 dark:text-amber-300">
                <li>
                  Create a GitHub Personal Access Token at{" "}
                  <a
                    href="https://github.com/settings/tokens"
                    className="text-blue-500 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    github.com/settings/tokens
                  </a>
                </li>
                <li>
                  Add the token to your{" "}
                  <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                    .env.local
                  </code>{" "}
                  file as{" "}
                  <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                    NEXT_PUBLIC_GITHUB_ACCESS_TOKEN=your_token
                  </code>
                </li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
