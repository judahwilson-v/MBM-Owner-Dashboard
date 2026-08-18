"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Truck, Package, LogOut, Settings, Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Sales Log", href: "/sales", icon: Truck },
  { name: "Boulders", href: "/boulder", icon: Package },
];

export function AppLayout({ children, userEmail, isConnected }: { children: React.ReactNode; userEmail?: string; isConnected: boolean }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-slate-200 bg-white">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MB</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Quarry Admin</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  isActive
                    ? "bg-slate-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200",
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-sm font-medium text-slate-600">
                {userEmail?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-slate-900 truncate">Owner</span>
              <span className="text-xs text-slate-500 truncate">{userEmail}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shadow-sm z-10">
          <div className="flex-1 flex">
            <form className="w-full max-w-md relative hidden sm:flex" action="#" method="GET">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                name="search"
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
