"use client";
// import useThemeToggle from "../../../hooks/useThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RoundButton from "@/components/ui/round-button";
import { Moon, Sun } from "lucide-react";
import { useLayoutEffect, useState } from "react";

const Theme = "theme";
enum Modes {
  DARK = "dark",
  LIGHT = "light",
}

const ThemeToggleButton = () => {
  const [activeTheme, setActiveTheme] = useState<Modes | null>(null);

  useLayoutEffect(() => {
    const localTheme = (localStorage.getItem(Theme) as Modes) || Modes.DARK;
    toggleTheme(localTheme);
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
