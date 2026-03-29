import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentComet Local",
  description: "Self-hosted local AgentComet UI and registry",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo_bg.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

