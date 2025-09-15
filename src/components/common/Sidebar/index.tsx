"use client";

import { useState } from "react";
import IconPreferenceAlert from "@/components/alerts/IconPreferences";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import { User, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ILink, LogoutButton, Navlink } from "../Navigation";
import IconToggle from "../Toggles/IconToggle";
import ThemeToggleButton from "../Toggles/ThemeToggle";
import PageHeader from "../Pageheader";

export const Sidebar = ({ navLinks }: { navLinks: ILink[] }) => {
  const pathName = usePathname();
  const { isAuthenticated, user } = useAuthContext();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) return null;

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between p-6">
      {/* Top: Logo and nav */}
      <div>
        <PageHeader title="FinTrack"></PageHeader>
        <nav className="flex flex-col gap-4 my-3">
          {navLinks.map((item) => (
            <Navlink
              link={{
                ...item,
                isActive: pathName === item.href,
              }}
              key={item.href}
              className="text-lg font-semibold"
            />
          ))}
        </nav>
      </div>

      {/* Bottom: Profile/Theme/Logout */}
      <div className="flex flex-col gap-4 border-t border-border pt-4">
        <DropdownMenu>
          <ThemeToggleButton />
          <DropdownMenuTrigger asChild>
            <div className="flex items-center justify-center gap-2 cursor-pointer">
              <PageHeader title={user?.data.name}></PageHeader>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              My Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <LogoutButton />
          </DropdownMenuContent>
        </DropdownMenu>
        <IconPreferenceAlert />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen bg-drawer text-primary border-r border-border shadow-md z-20">
        <SidebarContent />
      </aside>

      {/* Mobile: Top Bar with Hamburger */}
      <div className="md:hidden flex items-center justify-between bg-drawer p-4 border-b border-border shadow-md">
        <div className="text-xl font-bold">FinTrack</div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle sidebar"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-30">
          <div className="w-[260px] h-full bg-drawer text-black shadow-lg absolute left-0 top-0">
            <SidebarContent />
          </div>

          {/* Overlay click to close */}
          <div
            className="absolute inset-0 z-10"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
};
