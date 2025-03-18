"use client";
import { UpdateRepositoriesAction } from "@/app/actions/update-repositories";
import RepositoryCard from "@/components/RepositoryCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingAnimation from "@/components/ui/loading-animation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Repository } from "@/lib/github";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowUpDown, Filter, Github, Search } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface DashboardClientProps {
  username: string;
}

const DashboardClient = ({ username }: DashboardClientProps) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [totalRepos, setTotalRepos] = useState("0");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [sortOption, setSortOption] = useState("name");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSourceOnly, setShowSourceOnly] = useState(true);

  const itemsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { public_repos, repos } = await UpdateRepositoriesAction({
          username,
        });
        console.log("repos ", repos);
        setRepositories(repos);
        setTotalRepos(public_repos);
        if (repos.length === 0) {
          setError(
            "No repositories found. Make sure your GitHub token is set correctly in .env.local",
          );
        }
      } catch (err) {
        setError("Failed to fetch repositories. Check console for details.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [username]);

  const filteredRepos = repositories
    .filter(
      (repo) =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (languageFilter === "all" || !languageFilter
          ? true
          : repo.language === languageFilter) &&
        (showSourceOnly ? !repo.fork : true),
    )
    .sort((a, b) => {
      if (sortOption === "name") return a.name.localeCompare(b.name);
      if (sortOption === "stars")
        return (
          b.stargazers_count - a.stargazers_count ||
          a.name.localeCompare(b.name)
        );
      if (sortOption === "forks")
        return b.forks_count - a.forks_count || a.name.localeCompare(b.name);
      if (sortOption === "updated")
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime() ||
          a.name.localeCompare(b.name)
        );
      if (sortOption === "progress")
        return (
          (b.progress || 0) - (a.progress || 0) || a.name.localeCompare(b.name)
        );
      return a.name.localeCompare(b.name); // Default fallback sort
    });

  const paginatedRepos = filteredRepos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredRepos.length / itemsPerPage) || 1;
  const languages = Array.from(
    new Set(repositories.map((repo) => repo.language)),
  )
    .filter(Boolean)
    .sort();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <LoadingAnimation size={60} color="var(--primary)" />
          <h2 className="text-2xl font-semibold text-primary mt-6">
            Loading repositories...
          </h2>
          <p className="text-muted-foreground mt-2">
            Fetching GitHub repositories for {username}
          </p>
        </motion.div>
      </div>
    );
  }

  if (error && repositories.length !== 0) {
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
              <CardDescription className="text-red-500">
                {error}
              </CardDescription>
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
  }

  return (
    <div className="container mx-auto py-8 px-4 relative">
      <div className="absolute top-4 right-0 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center justify-center"
        >
          <Image
            src="/image.png"
            alt="Logo"
            width={120}
            height={120}
            className="rounded-lg object-cover"
          />
        </motion.div>
        <motion.h1
          className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Job Not Finished
        </motion.h1>
        <motion.p
          className="text-muted-foreground max-w-md mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Track your unfinished projects and get motivated to complete them
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50"
        >
          <AlertCircle size={16} className="text-amber-500" />
          <span className="text-sm text-muted-foreground">
            You have {totalRepos} projects, but how many will you actually
            finish?
          </span>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-muted-foreground" />
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown size={18} className="text-muted-foreground" />
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="stars">Stars</SelectItem>
              <SelectItem value="forks">Forks</SelectItem>
              <SelectItem value="updated">Last Updated</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Source Only Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex items-center space-x-2 mb-6"
      >
        <Switch
          id="source-only"
          checked={showSourceOnly}
          onCheckedChange={setShowSourceOnly}
        />
        <Label htmlFor="source-only">
          Show only repositories you created (exclude forks)
        </Label>
      </motion.div>

      {paginatedRepos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <div className="bg-muted/30 inline-flex rounded-full p-6 mb-4">
            <Search size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No repositories found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            No repositories match your current filters. Try adjusting your
            search criteria or filters.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <AnimatePresence>
            {paginatedRepos.map((repo, index) => (
              <RepositoryCard
                key={repo.id}
                repo_id={repo.id}
                name={repo.name}
                description={repo.description}
                language={repo.language}
                stars={repo.stargazers_count}
                forks={repo.forks_count}
                updatedAt={repo.updated_at}
                html_url={repo.html_url}
                index={index}
                isForked={repo.fork}
                lastActivity={Math.floor(
                  (new Date().getTime() - new Date(repo.updated_at).getTime()) /
                    (1000 * 60 * 60 * 24),
                )}
                // TODO: Get progress from backend or make it editable
                progress={repo.progress || 0}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-between items-center mt-8"
      >
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-left"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 ${
                currentPage === page ? "text-primary-foreground" : ""
              }`}
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="flex items-center gap-2"
        >
          Next
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-right"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Button>
      </motion.div>
    </div>
  );
};

export default DashboardClient;
