"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { createContext, useLayoutEffect, useState } from "react";
import { Modes } from "../common/ThemeToggle/ThemeToggle";

// Use a type to define the context value shape
type ContextWrapperType = {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  authenticateUser: (value: string) => void;
  logoutUser: () => void;
  setActiveTheme: (value: Modes) => void;
  activeTheme: Modes | null;
};

const MyContext = createContext<ContextWrapperType | null>(null);

export const ContextWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTheme, setActiveTheme] = useState<Modes | null>(null);
  const token = Cookies.get("token");

  const authenticateUser = (token: string) => {
    Cookies.set("token", token);
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    Cookies.remove("token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  const contextValue: ContextWrapperType = {
    isAuthenticated,
    setIsAuthenticated,
    authenticateUser,
    logoutUser,
    setActiveTheme,
    activeTheme,
  };

  useLayoutEffect(() => {
    if (token) {
      authenticateUser(token);
    } else {
      logoutUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>
  );
};

export const useAuthContext = () => {
  // Ensure that the context value is not null
  const contextValue = React.useContext(MyContext);
  if (!contextValue) {
    throw new Error("useAuthContext must be used within a MyContext.Provider");
  }
  return contextValue;
};
