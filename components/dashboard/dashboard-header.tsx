import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardHeaderProps } from "@/utils/types";
import { LogOut, Menu, Moon, RefreshCw, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { Switch } from "../ui/switch";

export const DashboardHeader = ({
  refreshRepositories,
  isRefreshing,
  theme,
  setTheme,
}: DashboardHeaderProps) => {
  return (
    <div className="absolute top-4 right-0 z-10 flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={refreshRepositories}
        disabled={isRefreshing}
        className="rounded-full"
      >
        <RefreshCw
          className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
        />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full">
            <Menu className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
            />
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/" })}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2 text-red-500">
              <LogOut className="h-4 w-4 mr-1" />
              <span>Logout</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
