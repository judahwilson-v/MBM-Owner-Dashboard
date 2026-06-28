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
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-50 selection:bg-[#f39c12]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
