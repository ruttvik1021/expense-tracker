"use client";
import { Moon, Sun } from "lucide-react";
import useThemeToggle from "../../../hooks/useThemeToggle"; // Assuming you saved the hook as useThemeToggle.ts

const ThemeToggleButton = () => {
  const { isDarkMode, toggleTheme } = useThemeToggle();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md bg-gray-200 dark:bg-gray-700"
    >
      {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
};

export default ThemeToggleButton;
