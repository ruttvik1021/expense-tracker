"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import { cn } from "@/lib/utils";
import { Circle, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export interface ILink {
  label: string;
  href: string;
  isActive?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const Navlink = ({
  link,
  className,
}: {
  link: ILink;
  className?: string;
}) => {
  return (
    <Link
      role="button"
      key={link.href}
      href={link.href}
      className={cn(
        "text-primary transition-colors flex items-center gap-2",
        link.isActive ? "font-bold text-selected" : "",
        className
      )}
      onClick={link.onClick}
    >
      {link.icon}
      {link.label}
    </Link>
  );
};

export const Brand = () => {
  return (
    <div className="flex items-center gap-3">
      <Image
        src={"/icon-512x512.png"}
        alt={"AkiraFlow"}
        width={36}
        height={36}
        style={{ borderRadius: "50%" }}
      />
      <h2 className="text-2xl font-bold tracking-tight text-blue-700">
        AkiraFlow
      </h2>
    </div>
  );
};

export const Navbar = ({ links }: { links: ILink[] }) => {
  const pathName = usePathname();
  return (
    <nav className="flex items-center gap-8">
      <Brand />
      {links.map((item) => (
        <Navlink
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
      <SheetContent side="left" className="shadow-lg border-selected">
        <div className="flex justify-end items-center"></div>
        <nav className="grid gap-6 text-lg font-medium">
          <div className="flex justify-between items-center">
            <Brand />
            <Circle
              onClick={toggleDrawer}
              className="fill-destructive rounded-lg icon border"
            />
          </div>
          {links.map((item) => (
            <Navlink
              link={{
                ...item,
                isActive: pathName === item.href,
                onClick: toggleDrawer,
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
    <Button
      className="w-full border border-red-300 text-red-700 bg-red hover:bg-red-100 hover:text-red-900 rounded-lg px-4 py-2 transition duration-300"
      onClick={logoutUser}
    >
      Logout
    </Button>
  );
};
