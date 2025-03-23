"use client";
import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/utils/constant";
import { motion } from "framer-motion";
import { Github } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        setIsLoggedIn(!!session?.user);
      } catch (error) {
        console.error("Failed to check auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Redirect if logged in
  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      window.location.href = "/dashboard";
    }
  }, [isLoggedIn, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/20 font-[family-name:var(--font-geist-sans)]"
    >
      {/* Header */}
      <motion.header
        variants={fadeIn}
        className="container mx-auto py-6 px-4 flex justify-between items-center"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl hidden sm:inline-block">
            Job Not Finished
          </span>
        </div>
        <div>
          {!isLoggedIn && (
            <Link href="/signin">
              <Button variant="outline" className="flex items-center gap-2">
                <Github size={18} />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <Hero isLoggedIn={isLoggedIn} />

      {/* Footer */}
      <motion.footer variants={fadeIn} className="bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span className="font-semibold">Job Not Finished</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Job Not Finished. All rights
              reserved.
            </div>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
}
