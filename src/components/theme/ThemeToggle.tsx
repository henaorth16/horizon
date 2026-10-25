"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by rendering placeholder with identical dimensions
  if (!mounted) {
    return (
      <div
        className={cn(
          "h-8 w-8 rounded-full border border-ink-700 bg-ink-800/50",
          className
        )}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "group relative flex h-8 w-8 items-center justify-center rounded-full border border-ink-700 bg-ink-800/80 transition-all hover:border-[#bc6c25] hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bc6c25]",
        className
      )}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      title={`Switch to ${isDark ? "Light Mode (Cozy Cream)" : "Dark Mode (Cozy Moss)"}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[#dda15e] transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-[#283618] transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
};
