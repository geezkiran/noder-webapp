"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium text-secondary transition-colors hover:bg-secondary_hover hover:text-primary dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="size-[15px] shrink-0" strokeWidth={1.75} />
      ) : (
        <Moon className="size-[15px] shrink-0" strokeWidth={1.75} />
      )}
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}
