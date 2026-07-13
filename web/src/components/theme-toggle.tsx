"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <Sun aria-hidden="true" className="theme-icon theme-icon-light h-4 w-4" />
      <Moon aria-hidden="true" className="theme-icon theme-icon-dark h-4 w-4" />
    </button>
  );
}
