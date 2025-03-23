import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStatusColor } from "@/utils/helpter";
import { ProjectProgressSectionProps } from "@/utils/types";
import { AnimatePresence, motion } from "framer-motion";
import { Circle, Pencil, Save } from "lucide-react";

export const ProjectProgressSection = ({
  isEditing,
  currentProgress,
  setIsEditing,
  progressValue,
  setProgressValue,
  isLoading,
  handleProgressUpdate,
  lastActivity,
}: ProjectProgressSectionProps) => {
  return (
    <div className="space-y-2 relative">
      <div className="flex justify-between items-center">
        <motion.span
          className="text-sm font-medium"
          animate={{
            color:
              (currentProgress || 0) === 100 ? "var(--success)" : "inherit",
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
                  variant={getStatusColor(
                    lastActivity || 0,
                    currentProgress || 0,
                  )}
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
            (currentProgress || 0) > 50 ? "text-white" : "text-muted-foreground"
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
  );
};
