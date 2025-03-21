"use client";

import { toggleReminder } from "@/app/actions/toggle-reminder";
import { updateProgress } from "@/app/actions/update-progress";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  BellRing,
  Calendar,
  Circle,
  Clock,
  Coffee,
  ExternalLink,
  GitFork,
  Pencil,
  Save,
  Star,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";

// Define CSS animation for the subtle pulse
const pulseAnimation = `
  @keyframes pulse-subtle {
    0% {
      opacity: 0.9;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.9;
    }
  }

  .animate-pulse-subtle {
    animation: pulse-subtle 2s ease-in-out infinite;
  }
`;

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
  onProgressUpdate?: (repoId: number, newProgress: number) => void;
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
  onProgressUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(progress);
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [reminder, setReminder] = useState(project_reminder || false);
  const [showCelebration, setShowCelebration] = useState(false);
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

  // Effect to trigger celebration animation when progress reaches 100%
  useEffect(() => {
    if ((currentProgress || 0) === 100) {
      setShowCelebration(true);
      playCompletionSound();
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentProgress]);

  // Function to play sound when project is completed
  const playCompletionSound = () => {
    // Only play sound if it's a browser environment
    if (typeof window !== "undefined") {
      try {
        // Create audio context
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();

        // Create oscillator for the sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Set sound properties (a happy sound)
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5

        // Set volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          0.3,
          audioContext.currentTime + 0.05,
        );
        gainNode.gain.linearRampToValueAtTime(
          0,
          audioContext.currentTime + 0.8,
        );

        // Play sound
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1);

        // Play second tone for a happy sound
        setTimeout(() => {
          const oscillator2 = audioContext.createOscillator();
          oscillator2.connect(gainNode);
          oscillator2.type = "sine";
          oscillator2.frequency.setValueAtTime(
            783.99,
            audioContext.currentTime,
          ); // G5

          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(
            0.3,
            audioContext.currentTime + 0.05,
          );
          gainNode.gain.linearRampToValueAtTime(
            0,
            audioContext.currentTime + 0.8,
          );

          oscillator2.start();
          oscillator2.stop(audioContext.currentTime + 0.8);
        }, 150);
      } catch (error) {
        console.error("Error playing completion sound:", error);
      }
    }
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

      // Call the parent callback to update the repositories array
      if (onProgressUpdate) {
        onProgressUpdate(repo_id, progressValue || 0);
      }
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
      exit={{
        opacity: 0,
        scale: progressValue === 100 ? 0.8 : 1,
        y: progressValue === 100 ? -30 : 0,
        transition: { duration: 0.5 },
      }}
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
      {/* Add custom styles for animations */}
      <style jsx global>
        {pulseAnimation}
      </style>

      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {Array.from({ length: 50 }).map((_, index) => (
            <motion.div
              key={index}
              className="absolute h-2 w-2 rounded-full"
              initial={{
                opacity: 1,
                top: "50%",
                left: "50%",
                scale: 0,
                backgroundColor: [
                  "#FF5733",
                  "#33FF57",
                  "#3357FF",
                  "#F3FF33",
                  "#FF33F3",
                  "#33FFF3",
                ][Math.floor(Math.random() * 6)],
              }}
              animate={{
                opacity: [1, 0.8, 0],
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                scale: [0, 1.5, 0.5],
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 2 + Math.random() * 1,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
      <Card
        className={`h-full overflow-hidden border-2 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 ${progressValue === 100 ? "border-green-500 bg-green-50/10" : ""}`}
      >
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
          <div className="space-y-2 relative">
            <div className="flex justify-between items-center">
              <motion.span
                className="text-sm font-medium"
                animate={{
                  color:
                    (currentProgress || 0) === 100
                      ? "var(--success)"
                      : "inherit",
                }}
                transition={{ duration: 0.3 }}
              >
                Project Progress
              </motion.span>
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="display"
                    className="flex items-center gap-1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge
                        variant={getStatusColor()}
                        className="transition-all duration-300 min-w-[52px] text-center"
                      >
                        {currentProgress || 0}%
                      </Badge>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil
                          size={14}
                          className="transition-transform duration-200 group-hover:rotate-12"
                        />
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="edit"
                    className="flex items-center gap-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
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
                        className={`transition-all duration-300 ${
                          progressValue === 100
                            ? "border-green-500 focus-visible:ring-green-500"
                            : ""
                        }`}
                      />
                      {progressValue === 100 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute -right-1 -top-1 h-3 w-3 bg-green-500 rounded-full"
                        />
                      )}
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        onClick={handleProgressUpdate}
                        disabled={isLoading}
                        className={`transition-all duration-300 ${
                          progressValue === 100
                            ? "bg-green-500 hover:bg-green-600"
                            : ""
                        }`}
                      >
                        {isLoading ? (
                          <Circle className="animate-spin" />
                        ) : (
                          <Save
                            size={14}
                            className="transition-transform duration-200 hover:rotate-12"
                          />
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <motion.div
                className="w-full h-6 bg-muted/50 rounded-md overflow-hidden"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className={`h-full rounded-md ${
                    (currentProgress || 0) === 100
                      ? "bg-gradient-to-r from-green-500 to-emerald-400"
                      : (currentProgress || 0) >= 90
                        ? "bg-gradient-to-r from-primary/80 to-primary animate-pulse-subtle"
                        : "bg-gradient-to-r from-primary/80 to-primary"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${currentProgress || 0}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                />
              </motion.div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${
                  (currentProgress || 0) > 50
                    ? "text-white"
                    : "text-muted-foreground"
                }`}
              >
                {currentProgress || 0}% Complete
              </motion.span>
            </div>
            {(currentProgress || 0) === 100 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute -right-2 -top-2 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3 text-white"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </motion.div>
            )}
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
