"use client";
import React from "react";
import { useAuthContext } from "./ContextWrapper";

const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthContext();
  return <div className={isAuthenticated ? "p-4 mt-1" : ""}>{children}</div>;
};

export default AppWrapper;
