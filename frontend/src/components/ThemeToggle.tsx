"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: theme is only known on the client.
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" aria-hidden />;

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle dark mode"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-lg transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
