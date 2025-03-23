"use client";
import { UpdateRepositoriesAction } from "@/app/actions/update-repositories";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { RepNotFoundError } from "@/components/dashboard/rep-not-found";
import { RepoSearializer } from "@/components/dashboard/repo-searializer";
import RepositoryCard from "@/components/RepositoryCard";
import { Button } from "@/components/ui/button";
import LoadingAnimation from "@/components/ui/loading-animation";
import { Repository } from "@/lib/github";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DashboardClientProps {
  username: string;
}

const DashboardClient = ({ username }: DashboardClientProps) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [totalUnCompletedProjects, setTotalUnCompletedProjects] = useState("0");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [sortOption, setSortOption] = useState("name");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [excludeRepo, setExcludeRepo] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { theme, setTheme } = useTheme();

  const itemsPerPage = 9;

  // Handle progress update from a repository card
  const handleProgressUpdate = (repoId: number, newProgress: number) => {
    setRepositories((prevRepos) =>
      prevRepos.map((repo) =>
        repo.id === repoId ? { ...repo, progress: newProgress } : repo,
      ),
    );
    if (newProgress === 100) {
      setTotalUnCompletedProjects((prev) => (parseInt(prev) + 1).toString());
    }
  };

  const refreshRepositories = async () => {
    try {
      setIsRefreshing(true);
      const { repos } = await UpdateRepositoriesAction({
        username,
      });
      setRepositories(repos);
      setTotalUnCompletedProjects(() => {
        return repos
          .filter((repo) => !repo.fork && repo.progress !== 100)
          .length.toString();
      });
      toast.success("Repositories refreshed successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh repositories");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { repos } = await UpdateRepositoriesAction({
          username,
        });
        setRepositories(repos);
        setTotalUnCompletedProjects(() => {
          return repos
            .filter((repo) => !repo.fork && repo.progress !== 100)
            .length.toString();
        });
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
        (excludeRepo ? !repo.fork && repo.progress !== 100 : true),
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
    return <RepNotFoundError error={error} />;
  }

  return (
    <div className="container mx-auto py-8 px-4 relative">
      <DashboardHeader
        refreshRepositories={refreshRepositories}
        isRefreshing={isRefreshing}
        theme={theme || "dark"}
        setTheme={setTheme}
      />

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
            You have {totalUnCompletedProjects} unfinished projects, but how
            many will you actually finish?
          </span>
        </motion.div>
      </motion.div>

      <RepoSearializer
        setSearchTerm={setSearchTerm}
        searchTerm={searchTerm}
        setLanguageFilter={setLanguageFilter}
        languageFilter={languageFilter}
        setSortOption={setSortOption}
        sortOption={sortOption}
        setExcludeRepo={setExcludeRepo}
        excludeRepo={excludeRepo}
        languages={languages}
      />

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
                project_reminder={repo.project_reminder}
                lastActivity={Math.floor(
                  (new Date().getTime() - new Date(repo.updated_at).getTime()) /
                    (1000 * 60 * 60 * 24),
                )}
                progress={repo.progress || 0}
                onProgressUpdate={handleProgressUpdate}
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
          <ChevronLeft className="h-4 w-4" />
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
          <ChevronRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
};

export default DashboardClient;
