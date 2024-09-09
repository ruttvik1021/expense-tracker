"use client";
// import useThemeToggle from "../../../hooks/useThemeToggle";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";

const Theme = "theme";
enum Modes {
  DARK = "dark",
  LIGHT = "light",
}

const ThemeToggleButton = () => {
  const [activeTheme, setActiveTheme] = useState<Modes | null>(null);

  const toggleTheme = (theme: Modes) => {
    const htmlElement = document.documentElement;

    if (activeTheme) {
      htmlElement.classList.remove(activeTheme);
    }

    localStorage.setItem(Theme, theme);
    htmlElement.classList.add(theme);
    setActiveTheme(theme);
  };

  return activeTheme === Modes.DARK ? (
    <Sun onClick={() => toggleTheme(Modes.LIGHT)} />
  ) : (
    <Moon onClick={() => toggleTheme(Modes.DARK)} />
  );
};

export default ThemeToggleButton;
