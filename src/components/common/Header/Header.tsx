import { Menu, Package2, Search } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ThemeToggleButton from "../ThemeToggle/ThemeToggle";

const Header = () => {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-white px-4 shadow-sm md:px-6 dark:bg-black">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="h-6 w-6 text-purple-600" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        <Link
          href="#"
          className="text-purple-600 transition-colors hover:text-purple-800"
        >
          Analytics
        </Link>
        <Link
          href="#"
          className="text-purple-600 transition-colors hover:text-purple-800"
        >
          Transactions
        </Link>
        <Link
          href="#"
          className="text-purple-600 transition-colors hover:text-purple-800"
        >
          Budget
        </Link>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6 text-purple-600" />
              <span className="sr-only">Acme Inc</span>
            </Link>
            <Link href="#" className="text-purple-600 hover:text-purple-800">
              Analytics
            </Link>
            <Link href="#" className="text-purple-600 hover:text-purple-800">
              Transactions
            </Link>
            <Link href="#" className="text-purple-600 hover:text-purple-800">
              Budget
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <ThemeToggleButton />
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black dark:bg-slate-400"
            >
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
