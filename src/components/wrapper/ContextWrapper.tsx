"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { createContext, useLayoutEffect, useState } from "react";
import { Modes } from "../common/ThemeToggle/ThemeToggle";

export interface ICategoryFilter {
  categoryDate: Date;
}

export interface ITransactionFilter {
  month: string;
  categoryId: string;
  minAmount: number;
  maxAmount: number;
}

// Use a type to define the context value shape
type ContextWrapperType = {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  authenticateUser: (value: string) => void;
  logoutUser: () => void;
  activeTheme: Modes | null;
  setActiveTheme: (value: Modes) => void;
  categoryFilter: ICategoryFilter;
  setCategoryFilter: (value: ICategoryFilter) => void;
  transactionFilter: Partial<ITransactionFilter>;
  setTransactionFilter: (value: Partial<ITransactionFilter>) => void;
};

export const initialTransactionFilter = {
  month: new Date().toISOString(),
  categoryId: "",
  minAmount: 0,
  maxAmount: 1000,
};

const MyContext = createContext<ContextWrapperType | null>(null);

export const ContextWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTheme, setActiveTheme] = useState<Modes | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ICategoryFilter>({
    categoryDate: new Date(),
  });
  const [transactionFilter, setTransactionFilter] = useState<
    Partial<ITransactionFilter>
  >({});
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
    categoryFilter,
    setCategoryFilter,
    transactionFilter,
    setTransactionFilter,
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
