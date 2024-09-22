"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import { User } from "lucide-react";
import { LogoutButton, Navbar, NavDrawer } from "../Navigation";
import ThemeToggleButton from "../ThemeToggle/ThemeToggle";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Category", href: "/category" },
  { label: "Transactions", href: "/transactions" },
];

export const NavHeader = () => {
  const { isAuthenticated } = useAuthContext();
  if (isAuthenticated) {
    return (
      <header className="bg-drawer flex h-16 justify-between items-center gap-4 px-4 shadow-md md:px-6 rounded-b-xl border-b-2 border-selected z-20">
        <div className="flex w-full justify-between items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-base lg:gap-6">
            <Navbar links={navLinks} />
          </nav>
          <NavDrawer links={navLinks} />
          <div className="flex gap-2 items-center">
            <ThemeToggleButton />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <User />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    );
  }
};

export const PageHeader = ({ title }: { title: string }) => {
  return <Label>{title}</Label>;
};
