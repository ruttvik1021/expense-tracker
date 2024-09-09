"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import { cn } from "@/lib/utils";
import { CrossIcon, IndianRupee, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export interface ILink {
  label: string;
  href: string;
  isActive?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const NavLink = ({ link }: { link: ILink }) => {
  return (
    <Link
      role="button"
      key={link.href}
      href={link.href}
      className={cn(
        "text-primary transition-colors",
        link.isActive ? "font-bold border-b-2 border-b-primary" : ""
      )}
      onClick={link.onClick}
    >
      {link.icon}
      {link.label}
    </Link>
  );
};

const Brand = () => {
  return <IndianRupee className="h-8 w-8 text-primary" />;
};

export const Navbar = ({ links }: { links: ILink[] }) => {
  const pathName = usePathname();
  return (
    <nav className="flex items-center gap-8">
      <Brand />
      {links.map((item) => (
        <NavLink
          link={{ ...item, isActive: pathName === item.href }}
          key={item.href}
        />
      ))}
    </nav>
  );
};

export const NavDrawer = ({ links }: { links: ILink[] }) => {
  const pathName = usePathname();
  const [open, setOpen] = React.useState<boolean>(false);
  const toggleDrawer = () => {
    setOpen(!open);
  };
  return (
    <Sheet open={open}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={toggleDrawer}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex justify-end items-center"></div>
        <nav className="grid gap-6 text-lg font-medium">
          <div className="flex justify-between items-center">
            <Brand />
            <CrossIcon className="rotate-45 w-4 h-4" onClick={toggleDrawer} />
          </div>
          {links.map((item) => (
            <NavLink
              link={{
                ...item,
                isActive: pathName === item.href,
                onClick: () => toggleDrawer(),
              }}
              key={item.href}
            />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export const LogoutButton = () => {
  const { logoutUser } = useAuthContext();
  return (
    <Button variant="destructive" className="w-full" onClick={logoutUser}>
      Logout
    </Button>
  );
};
