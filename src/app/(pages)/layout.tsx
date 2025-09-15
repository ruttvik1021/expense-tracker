import EmailVerification from "@/components/alerts/EmailVerification";
import { ContextWrapper } from "@/components/wrapper/ContextWrapper";
import QueryWrapper from "@/components/wrapper/QueryWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import "./globals.css";
import { Sidebar } from "@/components/common/Sidebar";
import { NavHeader } from "@/components/common/Headers";

const navLinks = [
  { label: "Home", href: "/dashboard" },
  { label: "Category", href: "/category" },
  { label: "Transactions", href: "/transactions" },
];

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
              <section className="flex-1 overflow-auto md:px-10 sm:px-4">
                {children}
              </section>
            </main>

            <Toaster richColors position="top-center" />
            <SpeedInsights />
          </ContextWrapper>
        </QueryWrapper>
      </body>
    </html>
  );
}
