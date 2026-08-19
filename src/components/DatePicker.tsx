"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

export function DatePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentDate = searchParams.get("date") || "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      router.push(`${pathname}?date=${val}`);
    } else {
      router.push(pathname);
    }
  };

  return (
    <div className="relative flex items-center">
      <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
        <Calendar className="h-4 w-4" />
      </div>
      <input
        type="date"
        value={currentDate}
        onChange={handleChange}
        className="pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
      />
    </div>
  );
}
