"use client";

import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";

export const Theme = "theme";
export enum Modes {
  DARK = "dark",
  LIGHT = "light",
}

const ThemeToggleButton = () => {
  const { activeTheme, setActiveTheme } = useAuthContext();
  const htmlElement = document.documentElement;

  // Apply theme on mount or when theme changes
  useEffect(() => {
    if (!activeTheme) return;

    htmlElement.classList.remove(Modes.DARK, Modes.LIGHT);
    htmlElement.classList.add(activeTheme);
    localStorage.setItem(Theme, activeTheme);
  }, [activeTheme]);

  const handleToggle = () => {
    const newTheme = activeTheme === Modes.DARK ? Modes.LIGHT : Modes.DARK;
    setActiveTheme(newTheme);
  };

  const showText = true; // Set to false to show icons only

  return showText ? (
    <Button variant="outline" size="sm" onClick={handleToggle}>
      {activeTheme === Modes.DARK ? "Light" : "Dark"}
    </Button>
  ) : (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label="Toggle theme"
    >
      {activeTheme === Modes.DARK ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
};

export default ThemeToggleButton;
