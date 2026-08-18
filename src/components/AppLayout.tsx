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
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      
      {/* Mobile Top Header (Fixed) */}
      <header className={cn(
        "sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl transition-shadow duration-200 border-b border-slate-200",
        scrolled ? "shadow-sm" : ""
      )}>
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900 leading-tight">
                {quarryName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  isConnected ? "bg-emerald-500" : "bg-rose-500 animate-pulse"
                )} />
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <form action="/login/actions/logout" method="POST">
            <button 
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 w-full max-w-lg mx-auto">
        <div className="p-4 sm:p-6 animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Fixed) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe">
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
                  <div className="absolute top-0 w-8 h-1 bg-indigo-600 rounded-b-full" />
                )}
                <item.icon 
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-indigo-600" : "text-slate-400"
                  )} 
                />
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-indigo-900" : "text-slate-500"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-slate-50 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow duration-200"
                placeholder="Search globally..."
              />
            </form>
          </div>
          <div className="ml-4 flex items-center md:ml-6 gap-4">
            <div className={cn(
              "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors",
              isConnected 
                ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                : "bg-rose-50 border-rose-200 text-rose-700"
            )}>
              <span className={cn(
                "relative flex h-2.5 w-2.5",
                isConnected ? "text-emerald-500" : "text-rose-500"
              )}>
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", isConnected ? "bg-emerald-500" : "bg-rose-500")}></span>
              </span>
              {isConnected ? "Live Sync Active" : "Sync Error"}
            </div>
            
            <button className="p-1 rounded-full text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <Bell className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto relative">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
