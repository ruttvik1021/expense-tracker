import type { Viewport } from "next";
import EmailVerification from "@/components/alerts/EmailVerification";
import { ContextWrapper } from "@/components/wrapper/ContextWrapper";
import QueryWrapper from "@/components/wrapper/QueryWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import "./globals.css";
import { Sidebar } from "@/components/common/Sidebar";
import { NavHeader } from "@/components/common/Headers";
import AppWrapper from "@/components/wrapper/AppWrapper";
import { ILink } from "@/components/common/Navigation";
import {
  Home,
  Smile,
  IndianRupee,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import IconPreferenceAlert from "@/components/alerts/IconPreferences";

const navLinks: ILink[] = [
  { label: "Home", href: "/dashboard", icon: <Home className="h-4 w-4" /> },
  { label: "Category", href: "/category", icon: <Smile className="h-4 w-4" /> },
  {
    label: "Transactions",
    href: "/transactions",
    icon: <IndianRupee className="h-4 w-4" />,
  },
  {
    label: "Insights",
    href: "/insights",
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    label: "Chat with Akira",
    href: "/chat",
    icon: <MessageCircle className="h-4 w-4" />,
  },
];

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function PageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryWrapper>
          <ContextWrapper>
            <EmailVerification />
            <main className="bg-background h-screen w-screen flex flex-col md:flex-row">
              {/* Sidebar: Only on md+ */}
              <div className="hidden md:flex bg-primary text-white">
                <Sidebar navLinks={navLinks} />
              </div>

              {/* Mobile Header: Only below md */}
              <div className="block md:hidden w-full">
                <NavHeader navLinks={navLinks} />
              </div>

              {/* Main Content Area */}
              <section className="flex-1 h-full overflow-auto">
                <AppWrapper>{children}</AppWrapper>
              </section>
            </main>

            <Toaster richColors position="top-center" />
            <SpeedInsights />

            <IconPreferenceAlert />
          </ContextWrapper>
        </QueryWrapper>
      </body>
    </html>
  );
}
