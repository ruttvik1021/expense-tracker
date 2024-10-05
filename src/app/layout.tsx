import { NavHeader } from "@/components/common/Headers";
import { ContextWrapper } from "@/components/wrapper/ContextWrapper";
import QueryWrapper from "@/components/wrapper/QueryWrapper";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import "./globals.css";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track your daily expenses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>
      <body>
        <QueryWrapper>
          <ContextWrapper>
            <main className="bg-background relative">
              <NavHeader />
              <section className="px-5 py-3">{children}</section>
            </main>
            <Toaster richColors position="top-center" />
            <SpeedInsights />
          </ContextWrapper>
        </QueryWrapper>
      </body>
    </html>
  );
}
