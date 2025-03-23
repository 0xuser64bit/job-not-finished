export interface RepositoryCardProps {
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

export interface ProjectProgressSectionProps {
  isEditing: boolean;
  currentProgress: number;
  setIsEditing: any;
  progressValue: number;
  setProgressValue: any;
  isLoading: boolean;
  handleProgressUpdate: any;
  lastActivity: number;
}

export interface DashboardHeaderProps {
  refreshRepositories: () => void;
  isRefreshing: boolean;
  theme: string;
  setTheme: (theme: string) => void;
}

export interface RepoSearializerProps {
  setSearchTerm: (searchTerm: string) => void;
  searchTerm: string;
  setLanguageFilter: (languageFilter: string) => void;
  languageFilter: string;
  setSortOption: (sortOption: string) => void;
  sortOption: string;
  setExcludeRepo: (excludeRepo: boolean) => void;
  excludeRepo: boolean;
  languages: string[];
}
