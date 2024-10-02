"use client";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";
// import useThemeToggle from "../../../hooks/useThemeToggle";
import { Moon, Sun } from "lucide-react";
import { useLayoutEffect } from "react";

const Theme = "theme";
export enum Modes {
  DARK = "dark",
  LIGHT = "light",
}

const ThemeToggleButton = () => {
  const { activeTheme, setActiveTheme } = useAuthContext();

  useLayoutEffect(() => {
    const isDarkTheme = localStorage.getItem(Theme) === Modes.DARK;
    toggleTheme(isDarkTheme ? Modes.DARK : Modes.LIGHT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
