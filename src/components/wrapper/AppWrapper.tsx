"use client";
import React from "react";
import { useAuthContext } from "./ContextWrapper";
import { cn } from "@/lib/utils"; // Assuming you use a classNames utility

const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthContext();

  return (
    <div
      className={cn(
        "h-full flex flex-col overflow-auto",
        isAuthenticated && "p-2 pb-2 sm:p-4 lg:p-6"
      )}
    >
      {children}
    </div>
  );
};

export default AppWrapper;
