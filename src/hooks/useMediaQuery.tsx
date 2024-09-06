"use client";
import { useState, useEffect } from "react";

// Define the common breakpoints
const MOBILE_MAX_WIDTH = 640; // Example: Tailwind's `sm` breakpoint
const TABLET_MAX_WIDTH = 1024; // Example: Tailwind's `md` breakpoint

export const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  const updateDeviceType = () => {
    const width = window.innerWidth;
    setDeviceType({
      isMobile: width <= MOBILE_MAX_WIDTH,
      isTablet: width > MOBILE_MAX_WIDTH && width <= TABLET_MAX_WIDTH,
      isDesktop: width > TABLET_MAX_WIDTH,
    });
  };

  useEffect(() => {
    // Set initial value on mount
    updateDeviceType();

    // Add event listener to handle window resize
    window.addEventListener("resize", updateDeviceType);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", updateDeviceType);
    };
  }, []);

  return deviceType;
};
