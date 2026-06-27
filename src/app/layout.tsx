import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MBM Owner Dashboard",
  description: "Read-only dashboard for MBM Quarry owner monitoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
