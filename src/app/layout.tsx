import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AkiraFlow",
  description: "Graceful Control Over Your Cash Flow.",
  generator: "Next.js",
  manifest: "/manifest.json",
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
        <main>{children}</main>
      </body>
    </html>
  );
}
