import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-in fade-in duration-500">
      <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading data...</p>
    </div>
  );
}
