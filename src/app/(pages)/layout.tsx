import EmailVerification from "@/components/alerts/EmailVerification";
import { NavHeader } from "@/components/common/Headers";
import { ContextWrapper } from "@/components/wrapper/ContextWrapper";
import QueryWrapper from "@/components/wrapper/QueryWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import "./globals.css";

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
            <main className="bg-background relative h-screen justify-center">
              <EmailVerification />
              <NavHeader />
              <section className={"md:px-40 sm:px-3"}>{children}</section>
            </main>
            <Toaster richColors position="top-center" />
            <SpeedInsights />
          </ContextWrapper>
        </QueryWrapper>
      </body>
    </html>
  );
}
