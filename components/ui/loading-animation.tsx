'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  size?: number;
  color?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  size = 40, 
  color = 'currentColor' 
}) => {
  const containerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  const circleVariants = {
    initial: { opacity: 0.2 },
    animate: {
      opacity: [0.2, 1, 0.2],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      animate="animate"
      style={{
        width: size,
        height: size,
        position: 'relative'
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i * 60) * (Math.PI / 180);
          const x = 50 + 35 * Math.cos(angle);
          const y = 50 + 35 * Math.sin(angle);
          const delay = i * 0.15;
          
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={size / 10}
              fill={color}
              initial={{ opacity: 0.2 }}
              animate={{ 
                opacity: [0.2, 1, 0.2],
                transition: {
                  duration: 1.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop",
                  delay
                }
              }}
            />
          );
        })}
      </svg>
    </motion.div>
  );
};

export default LoadingAnimation; 