import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateHslColor = (index: number, totalItems: number): string => {
  // Cycle through hues (360 degrees) based on the index and total number of items
  const hue = (index * 360) / totalItems;
  const saturation = 60; // You can adjust the saturation (0-100)
  const lightness = 60; // You can adjust the lightness (0-100)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
