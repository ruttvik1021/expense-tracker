"use client";
import React from "react";
import { useAuthContext } from "./ContextWrapper";

const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthContext();
  return (
    <div className={isAuthenticated ? "p-2 sm:p-4 lg:p-6" : ""}>{children}</div>
  );
};

export default AppWrapper;
