"use client";

import { toggleReminder } from "@/app/actions/toggle-reminder";
import { updateProgress } from "@/app/actions/update-progress";
import { languageColors, pulseAnimation } from "@/utils/constant";
import { getMotivationalRoast, playCompletionSound } from "@/utils/helpter";
import { RepositoryCardProps } from "@/utils/types";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BellRing,
  Calendar,
  Clock,
  Coffee,
  ExternalLink,
  GitFork,
  Star,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { CompleteCelebration } from "./repository/complete-celebration";
import { ProjectProgressSection } from "./repository/project-progress-section";
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

      {showCelebration && <CompleteCelebration />}
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

          <ProjectProgressSection
            isEditing={isEditing}
            currentProgress={currentProgress || 0}
            setIsEditing={setIsEditing}
            progressValue={progressValue || 0}
            setProgressValue={setProgressValue}
            isLoading={isLoading}
            handleProgressUpdate={handleProgressUpdate}
            lastActivity={lastActivity || 0}
          />
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
