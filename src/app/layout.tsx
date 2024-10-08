import { NavHeader } from "@/components/common/Headers";
import { ContextWrapper } from "@/components/wrapper/ContextWrapper";
import QueryWrapper from "@/components/wrapper/QueryWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track your daily expenses",
  generator: "Next.js",
  manifest: "/manifest.json",
  viewport:
    "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  icons: [
    { rel: "apple-touch-icon", url: "icon-128x128.png" },
    { rel: "icon", url: "icon-128x128.png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryWrapper>
          <ContextWrapper>
            <main className="bg-background relative h-screen">
              <NavHeader />
              <section className="px-5 py-3 pb-10">{children}</section>
            </main>
            <Toaster richColors position="top-center" />
            <SpeedInsights />
          </ContextWrapper>
        </QueryWrapper>
      </body>
    </html>
  );
}
