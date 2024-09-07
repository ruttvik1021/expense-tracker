"use client";
import { Moon, Sun } from "lucide-react";
import useThemeToggle from "../../../hooks/useThemeToggle"; // Assuming you saved the hook as useThemeToggle.ts

const ThemeToggleButton = () => {
  const { isDarkMode, toggleTheme } = useThemeToggle();

  return isDarkMode ? (
    <Moon className="h-6 w-6" color="white" onClick={toggleTheme} />
  ) : (
    <Sun className="h-6 w-6" color="black" onClick={toggleTheme} />
  );
};

export default ThemeToggleButton;
