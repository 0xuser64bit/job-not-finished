import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RepoSearializerProps } from "@/utils/types";
import { motion } from "framer-motion";
import { ArrowUpDown, Filter, Search } from "lucide-react";

export const RepoSearializer = ({
  setSearchTerm,
  searchTerm,
  setLanguageFilter,
  languageFilter,
  setSortOption,
  sortOption,
  setExcludeRepo,
  excludeRepo,
  languages,
}: RepoSearializerProps) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-muted-foreground" />
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown size={18} className="text-muted-foreground" />
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="stars">Stars</SelectItem>
              <SelectItem value="forks">Forks</SelectItem>
              <SelectItem value="updated">Last Updated</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex items-center space-x-2 mb-6"
      >
        <Switch
          id="source-only"
          checked={excludeRepo}
          onCheckedChange={setExcludeRepo}
        />
        <Label htmlFor="source-only">
          exclude forks and completed projects
        </Label>
      </motion.div>
    </>
  );
};
