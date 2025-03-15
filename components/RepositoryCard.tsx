'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { motion } from 'framer-motion';
import { Star, GitFork, Clock, ExternalLink } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface RepositoryCardProps {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
  html_url?: string;
  index: number;
}

// Language color mapping
const languageColors: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  null: '#cccccc',
};

const RepositoryCard: React.FC<RepositoryCardProps> = ({
  name,
  description,
  language,
  stars,
  forks,
  updatedAt,
  html_url,
  index,
}) => {
  const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  });
  
  const languageColor = languageColors[language as keyof typeof languageColors] || '#cccccc';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.1
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <Card className="h-full overflow-hidden border-2 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold truncate">{name}</CardTitle>
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
          <CardDescription className="line-clamp-2 h-10 text-muted-foreground">
            {description || "No description provided"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2">
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
        </CardContent>
        
        <CardFooter className="pt-2">
          {html_url && (
            <motion.div className="w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => window.open(html_url, '_blank')}
              >
                <ExternalLink size={14} />
                View Repository
              </Button>
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RepositoryCard; 