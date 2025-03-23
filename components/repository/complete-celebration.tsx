import { motion } from "framer-motion";

export const CompleteCelebration = () => {
  return (
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
  );
};
