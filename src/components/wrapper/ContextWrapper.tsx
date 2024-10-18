"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { createContext, useEffect, useState } from "react";
import { CategorySortBy } from "../category";
import { Modes, Theme } from "../common/Toggles/ThemeToggle";
import { IS_ICON_PREFERRED } from "../common/Toggles/IconToggle";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/utils/queryKeys";
import { getProfile } from "../../../server/actions/profile/profile";
import { deleteSession } from "@/lib/session";

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

// Define the context value type
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
  isEmailVerified: boolean;
  verifyUserEmail: () => void;
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
  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: [queryKeys.profile],
    queryFn: () => getProfile(),
    staleTime: Infinity,
    enabled: !!token,
  });

  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(
    user?.data?.isVerified
  );
  const verifyUserEmail = () => {
    setIsEmailVerified(true);
    refetchUser();
  };
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [isIconPreferred, setIsIconPreferred] = useState<boolean>(false);
  const [activeTheme, setActiveTheme] = useState<Modes | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ICategoryFilter>({
    categoryDate: new Date(),
    sortBy: CategorySortBy.RECENT_TRANSACTIONS,
  });
  const [transactionFilter, setTransactionFilter] = useState<
    Partial<ITransactionFilter>
  >({
    month: moment().format(),
  });

  const authenticateUser = (token: string) => {
    Cookies.set("token", token);
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    Cookies.remove("token");
    deleteSession();
    setIsAuthenticated(false);
    router.push("/login");
  };

  useEffect(() => {
    const isIconPreferredStored =
      localStorage.getItem(IS_ICON_PREFERRED) === "true";
    setIsIconPreferred(isIconPreferredStored);

    const localStoredTheme =
      localStorage.getItem(Theme) === Modes.DARK ? Modes.DARK : Modes.LIGHT;
    setActiveTheme(localStoredTheme);

    if (token) {
      authenticateUser(token);
    } else {
      logoutUser();
    }
  }, [token]);

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
    isEmailVerified,
    verifyUserEmail,
  };

  return (
    <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>
  );
};

export const useAuthContext = () => {
  const contextValue = React.useContext(MyContext);
  if (!contextValue) {
    throw new Error("useAuthContext must be used within a MyContext.Provider");
  }
  return contextValue;
};
