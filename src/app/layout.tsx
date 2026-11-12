import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { activeOwner } from "@/lib/owner-auth/service";
import { AppLayout } from "@/components/AppLayout";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/ThemeProvider";

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

  const authorizedOwner = user ? await activeOwner(supabase,user.id) : false;
  let isConnected = false;
  let quarryName = "MBM Quarry";
  
  if (authorizedOwner) {
    const { data: globalSettings, error } = await supabase
      .from("website_global_settings")
      .select("quarry_name")
      .limit(1)
      .single();
    isConnected = !error && globalSettings !== null;
    if (globalSettings?.quarry_name) {
      quarryName = globalSettings.quarry_name;
    }
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {authorizedOwner ? (
            <AppLayout quarryName={quarryName} isConnected={isConnected}>
              {children}
            </AppLayout>
          ) : (
            children
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
