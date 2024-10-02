"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { createContext, useLayoutEffect, useState } from "react";
import { CategorySortBy } from "../category";
import { Modes, Theme } from "../common/Toggles/ThemeToggle";
import { IS_ICON_PREFERRED } from "../common/Toggles/IconToggle";

export interface ICategoryFilter {
  categoryDate: Date;
  sortBy: CategorySortBy;
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
  isIconPreferred: boolean;
  setIsIconPreferred: (value: boolean) => void;
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

  const token = Cookies.get("token");
  const [isAuthenticated, setIsAuthenticated] = useState(token ? true : false);

  const isIconPreferredStored =
    localStorage.getItem(IS_ICON_PREFERRED) === "true";
  const [isIconPreferred, setIsIconPreferred] = useState(isIconPreferredStored);

  const localStoredTheme =
    localStorage.getItem(Theme) === Modes.DARK ? Modes.DARK : Modes.LIGHT;
  const [activeTheme, setActiveTheme] = useState<Modes | null>(
    localStoredTheme
  );

  const [categoryFilter, setCategoryFilter] = useState<ICategoryFilter>({
    categoryDate: new Date(),
    sortBy: CategorySortBy.RECENT_TRANSACTIONS,
  });
  const [transactionFilter, setTransactionFilter] = useState<
    Partial<ITransactionFilter>
  >({});

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
    isIconPreferred,
    setIsIconPreferred,
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
