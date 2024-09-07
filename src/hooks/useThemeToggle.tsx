"use client";

import { useState } from "react";

export const Theme = "theme";
enum Modes {
  DARK = "dark",
  LIGHT = "light",
}

const useThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const toggleTheme = async () => {
    if (!isDarkMode) {
      document.documentElement.classList.add(Modes.DARK);
      localStorage.setItem(Theme, Modes.DARK);
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove(Modes.DARK);
      localStorage.setItem(Theme, Modes.LIGHT);
      setIsDarkMode(false);
    }
  };

  return { isDarkMode, toggleTheme };
};

export default useThemeToggle;
