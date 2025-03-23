// Language color mapping
export const languageColors: Record<string, string> = {
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

// Define CSS animation for the subtle pulse
export const pulseAnimation = `
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

// Animation variants
export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

export const imageVariants = {
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
