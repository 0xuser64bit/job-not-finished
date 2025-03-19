"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";
import { motion } from "framer-motion";
import {
  Star,
  GitFork,
  Clock,
  ExternalLink,
  AlertCircle,
  Calendar,
  Coffee,
  Pencil,
  Save,
  Circle,
  BellRing,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { updateProgress } from "@/app/actions/update-progress";
import { toggleReminder } from "@/app/actions/toggle-reminder";

interface RepositoryCardProps {
  repo_id: number;
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
  html_url?: string;
  index: number;
  isForked?: boolean;
  lastActivity?: number;
  project_reminder?: boolean;
  progress?: number;
}

// Language color mapping
const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  null: "#cccccc",
};

// Function to generate a motivational roast based on last activity
const getMotivationalRoast = (days: number, progress: number) => {
  if (days > 90 && progress < 30) {
    return "This project is collecting more dust than your gym membership card.";
  } else if (days > 60 && progress < 50) {
    return "Your project is aging like milk, not wine. Time to revive it!";
  } else if (days > 30 && progress < 70) {
    return "Another day, another excuse not to finish this project.";
  } else if (days > 14) {
    return "Coffee's getting cold. Time to wake up and code!";
  } else {
    return "You're on a roll! Don't stop now!";
  }
};

const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repo_id,
  name,
  description,
  language,
  stars,
  forks,
  updatedAt,
  html_url,
  index,
  isForked = false,
  lastActivity,
  project_reminder,
  progress,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(progress);
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [reminder, setReminder] = useState(project_reminder || false);
  const formattedDate = new Date(updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  const languageColor =
    languageColors[language as keyof typeof languageColors] || "#cccccc";
  const roast = getMotivationalRoast(lastActivity || 0, progress || 0);

  // Determine status color based on last activity and progress
  const getStatusColor = () => {
    if (lastActivity && lastActivity > 60) return "destructive";
    if (lastActivity && lastActivity > 30) return "warning";
    if (lastActivity && lastActivity > 14) return "info";
    return "success";
  };

  const handleProgressUpdate = async () => {
    setIsEditing(false);
    setIsLoading(true);

    try {
      await updateProgress({
        repo_id: repo_id.toString(),
        newProgressValue: progressValue || 0,
      });
      // Update the local state to reflect the new progress value
      setCurrentProgress(progressValue);
    } catch (error) {
      console.error("Failed to update progress:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSetReninder = async () => {
    await toggleReminder({
      repo_id: repo_id.toString(),
      project_reminder: reminder ?? false,
    });
    setReminder(!reminder);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.1,
      }}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 },
      }}
    >
      <Card className="h-full overflow-hidden border-2 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold truncate">{name}</CardTitle>
            <div className="flex gap-1">
              {isForked && (
                <Badge variant="secondary" className="ml-2">
                  Forked
                </Badge>
              )}
              {language && (
                <Badge
                  variant="outline"
                  className="ml-2 flex items-center gap-1.5"
                  style={{ borderColor: languageColor }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: languageColor }}
                  ></span>
                  {language}
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="line-clamp-2 h-10 text-muted-foreground">
            {description || "No description provided"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-2">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <motion.div
              className="flex items-center gap-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star size={16} className="text-yellow-500" />
              <span>{stars.toLocaleString()}</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <GitFork size={16} className="text-blue-500" />
              <span>{forks.toLocaleString()}</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Clock size={16} className="text-green-500" />
              <span>{formattedDate}</span>
            </motion.div>
          </div>

          {/* Project Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Project Progress</span>
              {!isEditing ? (
                <div className="flex items-center gap-1">
                  <Badge variant={getStatusColor()}>{currentProgress}%</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil size={14} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Input
                    value={progressValue || 0}
                    onChange={(e) =>
                      parseInt(e.target.value) > 100
                        ? setProgressValue(100)
                        : setProgressValue(parseInt(e.target.value))
                    }
                    type="number"
                    min={0}
                    max={100}
                  />
                  <Button
                    size="sm"
                    onClick={handleProgressUpdate}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Circle className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                  </Button>
                </div>
              )}
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>

          {/* Motivational Roast */}
          <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
            <Coffee size={16} className="text-amber-500 mt-0.5" />
            <p className="text-xs italic">{roast}</p>
          </div>

          {/* Last Activity */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar size={14} />
            <span>{lastActivity} days since last activity</span>
          </div>
        </CardContent>

        <CardFooter className="pt-2 gap-2">
          {html_url && (
            <motion.div
              className="w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => window.open(html_url, "_blank")}
              >
                <ExternalLink size={14} />
                View Repository
              </Button>
            </motion.div>
          )}
          <motion.div
            className="w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={reminder ? "secondary" : "default"}
              size="sm"
              className={`w-full gap-1`}
              onClick={handleSetReninder}
            >
              {reminder ? (
                <BellRing size={14} />
              ) : (
                <>
                  <AlertCircle size={14} />
                  Set Reminder
                </>
              )}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RepositoryCard;
