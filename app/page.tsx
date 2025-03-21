"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Github, CheckCircle, Clock, Bell, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -8 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: -3,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.2,
      },
    },
  };

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
      <main className="flex-1">
        <section className="container mx-auto py-16 md:py-24 px-4 flex flex-col md:flex-row items-center gap-12">
          <motion.div variants={fadeIn} className="flex-1 space-y-6 max-w-2xl">
            <motion.h1
              variants={fadeIn}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
            >
              <span className="text-primary">Finish</span> What You Started
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="text-xl text-muted-foreground"
            >
              A powerful tool that helps developers track, manage, and complete
              their unfinished GitHub projects through motivation, progress
              tracking, and friendly reminders.
            </motion.p>
            <motion.div
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              {!isLoggedIn && (
                <Link href="/signin">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    <Github size={20} />
                    Connect with GitHub
                  </Button>
                </Link>
              )}
              <a
                href="#features"
                className="inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById("features");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 w-full sm:w-auto"
                >
                  Learn More
                  <ArrowRight size={18} />
                </Button>
              </a>
            </motion.div>
          </motion.div>
          <motion.div variants={fadeIn} className="flex-1 relative">
            <div className="relative w-full max-w-md mx-auto aspect-square">
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.9, rotate: 8 },
                  visible: {
                    opacity: 1,
                    scale: 0.95,
                    rotate: 3,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      delay: 0.1,
                    },
                  },
                }}
                className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg"
              ></motion.div>

              <motion.div
                variants={imageVariants}
                className="absolute inset-0 z-10 rounded-lg shadow-xl bg-card overflow-hidden"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="text-center p-6">
                    <Image
                      // TODO: why public images're not working?
                      src="https://raw.githubusercontent.com/user-64bit/job-not-finished/refs/heads/main/public/image.png"
                      alt="Dashboard Preview"
                      width={500}
                      height={300}
                      className="object-contain z-50 rounded-lg"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="container mx-auto py-16 md:py-24 px-4"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Use Job Not Finished?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We help you turn unfinished projects into completed achievements
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Github size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">GitHub Integration</h3>
              <p className="text-muted-foreground">
                Connect with your GitHub account to automatically import and
                track all your repositories in one place.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Visualize your project completion with intuitive progress bars
                and set milestones to stay motivated.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Bell size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Reminders</h3>
              <p className="text-muted-foreground">
                Receive weekly email reminders with motivational messages to
                keep you engaged with your projects.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Activity Insights</h3>
              <p className="text-muted-foreground">
                Get detailed insights about your project activity, stars, and
                open issues to prioritize your work.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 2v8"></path>
                  <path d="m4.93 10.93 1.41 1.41"></path>
                  <path d="M2 18h2"></path>
                  <path d="M20 18h2"></path>
                  <path d="m19.07 10.93-1.41 1.41"></path>
                  <path d="M22 22H2"></path>
                  <path d="m16 6-4 4-4-4"></path>
                  <path d="M16 18a4 4 0 0 0-8 0"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Motivational Roasts
              </h3>
              <p className="text-muted-foreground">
                Receive friendly &quot;roasts&quot; that motivate you to
                continue working on your unfinished projects.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                  <path d="M9 17c2 0 4-1 4-3.5S11 10 9 10s-4 1-4 3.5S7 17 9 17Z"></path>
                  <path d="M9 10c-2 0-4-1-4-3.5S7 3 9 3s4 1 4 3.5S11 10 9 10Z"></path>
                  <path d="M15 17c2 0 4-1 4-3.5S17 10 15 10s-4 1-4 3.5 2 3.5 4 3.5Z"></path>
                  <path d="M15 10c-2 0-4-1-4-3.5S13 3 15 3s4 1 4 3.5-2 3.5-4 3.5Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Repository Filtering
              </h3>
              <p className="text-muted-foreground">
                Filter repositories by language, search by name, and sort by
                various criteria to focus on what matters most.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <motion.section
          variants={fadeIn}
          className="bg-primary/5 py-16 md:py-24"
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Finish Your Projects?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of developers who have transformed their unfinished
              projects into completed achievements.
            </p>
            {!isLoggedIn && (
              <Link href="/signin">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="gap-2">
                    <Github size={20} />
                    Get Started with GitHub
                  </Button>
                </motion.div>
              </Link>
            )}
          </div>
        </motion.section>
      </main>

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
