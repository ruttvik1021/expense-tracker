import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton, Navbar, NavDrawer } from "../Navigation";
import ThemeToggleButton from "../ThemeToggle/ThemeToggle";
import { Label } from "@/components/ui/label";

const navLinks = [{ label: "Dashboard", href: "/dashboard" }];

export const NavHeader = () => {
  return (
    <header className="bg-header sticky top-0 flex h-16 justify-between items-center gap-4 border-b px-4 shadow-sm md:px-6 ">
      <div className="flex w-full justify-between items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
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
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export const PageHeader = ({ title }: { title: string }) => {
  return <Label>{title}</Label>;
};
