import type { Metadata, Viewport } from "next";
import type React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cellar",
  description: "An elegant AI-powered wine cellar for collectors."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3B0C1B"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
