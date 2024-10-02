"use client";
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

  useEffect(() => {
    if (activeTheme) {
      toggleTheme(activeTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTheme]);

  const toggleTheme = (theme: Modes) => {
    localStorage.setItem(Theme, theme);
    htmlElement.classList.add(theme);
  };

  return activeTheme === Modes.DARK ? (
    <Sun
      onClick={() => {
        setActiveTheme(Modes.LIGHT);
        htmlElement.classList.remove(Modes.DARK);
      }}
    />
  ) : (
    <Moon
      onClick={() => {
        setActiveTheme(Modes.DARK);
        htmlElement.classList.remove(Modes.LIGHT);
      }}
    />
  );
};

export default ThemeToggleButton;
