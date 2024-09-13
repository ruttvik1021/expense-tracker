"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { createContext, useEffect, useState } from "react";

// Use a type to define the context value shape
type ContextWrapperType = {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  authenticateUser: (value: string) => void;
  logoutUser: () => void;
};

const MyContext = createContext<ContextWrapperType | null>(null);

export const ContextWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
  };

  useEffect(() => {
    if (token) {
      authenticateUser(token);
    } else {
      logoutUser();
    }
  }, [authenticateUser, logoutUser, token]);

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
