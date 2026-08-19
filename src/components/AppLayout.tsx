"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Truck, 
  Database,
  Activity,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

interface AppLayoutProps {
  children: React.ReactNode;
  isConnected: boolean;
  quarryName: string;
}

export function AppLayout({ children, isConnected, quarryName }: AppLayoutProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Add subtle shadow to top header on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: LayoutDashboard },
    { name: 'Sales', href: '/sales', icon: Truck },
    { name: 'Boulders', href: '/boulder', icon: Database },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20">
      
      {/* Mobile Top Header (Fixed) */}
      <header className={cn(
        "sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-shadow duration-200 border-b border-slate-200 dark:border-slate-800",
        scrolled ? "shadow-sm dark:shadow-slate-900/50" : ""
      )}>
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                {quarryName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  isConnected ? "bg-emerald-500" : "bg-rose-500 animate-pulse"
                )} />
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action="/login/actions/logout" method="POST">
              <button 
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 w-full max-w-lg mx-auto">
        <div key={pathname} className="p-4 sm:p-6 animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Fixed) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="flex h-16 max-w-lg mx-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative"
              >
                {isActive && (
                  <div className="absolute top-0 w-8 h-1 bg-indigo-600 dark:bg-indigo-500 rounded-b-full" />
                )}
                <item.icon 
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                  )} 
                />
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-indigo-900 dark:text-indigo-100" : "text-slate-500 dark:text-slate-400"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
