"use client";
import { queryKey } from "@/utils/queryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Theme = "theme";
enum Modes {
  DARK = "dark",
  LIGHT = "light",
}

// Custom hook to handle theme toggling
const useThemeToggle = () => {
  // Function to fetch the theme from localStorage or an API
  const fetchTheme = async () => {
    const theme = localStorage.getItem(Theme);
    return theme === Modes.DARK;
  };

  // Function to update the theme in localStorage and on the DOM
  const updateTheme = async (isDark: boolean) => {
    if (!isDark) {
      document.documentElement.classList.add(Modes.DARK);
      localStorage.setItem(Theme, Modes.DARK);
    } else {
      document.documentElement.classList.remove(Modes.DARK);
      localStorage.setItem(Theme, Modes.LIGHT);
    }
  };

  // Use React Query to fetch the current theme
  const { data: isDarkMode, refetch } = useQuery({
    queryKey: [queryKey.theme],
    queryFn: fetchTheme,
    initialData: false, // Default to light mode if no saved theme
  });

  // Use mutation to update the theme
  const mutation = useMutation({
    mutationFn: updateTheme,
  });

  // Automatically apply the theme when `isDarkMode` changes
  useEffect(() => {
    mutation.mutate(isDarkMode);
  }, [isDarkMode, mutation]);

  // Function to toggle the theme
  const toggleTheme = () => {
    mutation.mutate(!isDarkMode); // Toggle theme
    refetch(); // Re-fetch the theme after toggling
  };

  return { isDarkMode, toggleTheme };
};

export default useThemeToggle;
