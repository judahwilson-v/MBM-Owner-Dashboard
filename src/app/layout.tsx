import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/AppLayout";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MBM Owner Dashboard",
  description: "Read-only analytics and monitoring for MBM Quarry",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isConnected = false;
  if (user) {
    const { data: globalSettings, error } = await supabase
      .from("global_settings")
      .select("quarry_name")
      .limit(1)
      .single();
    isConnected = !error && globalSettings;
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        {user ? (
          <AppLayout userEmail={user.email} isConnected={isConnected}>
            {children}
          </AppLayout>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
