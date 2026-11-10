import {loadOwnerOverview,siteDate,siteDateTime} from "@/lib/erp-read-contract";
import { createClient } from "@/utils/supabase/server";
import { Activity, DollarSign, TrendingUp, Truck, ChevronRight } from "lucide-react";
import React from "react";
import Link from "next/link";

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const overview=await loadOwnerOverview(supabase);
  if(overview.status==='unavailable')return <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950"><h1 className="font-bold">Financial overview unavailable</h1><p>The synced records could not be verified. No zero balances or profit figures are substituted.</p></div>;
  const {todaysSales,todaysQty,dispatchCount,revenue,recordedExpenses,cash}=overview;
  const monthlyDifference=revenue-recordedExpenses;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-6">

      {/* Mobile Greeting */}
      <div className="pt-2 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">Synced records for {overview.date} (India time)</p>
      </div>

      {/* Primary KPI: Today's Sales (Hero Card) */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-600 to-blue-700 p-6 shadow-lg shadow-indigo-600/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="flex items-center justify-between relative z-10">
          <h3 className="text-indigo-100 font-medium text-sm">Today&apos;s Sales</h3>
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-4 relative z-10">
          <div className="text-4xl font-bold tracking-tight">{formatCurrency(todaysSales)}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-medium text-emerald-200 border border-emerald-400/30">
              <TrendingUp className="mr-1 h-3 w-3" /> Synced
            </span>
            <span className="text-indigo-200 text-xs">{todaysQty.toFixed(0)} CFT dispatched</span>
          </div>
        </div>
      </div>

      {/* Secondary KPIs Grid (2 Columns on Mobile) */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          title="Last recorded cash"
          value={cash?formatCurrency(cash.amount):"Unavailable"}
          subValue={cash?`Business date ${siteDate(new Date(cash.businessDate))}`:"No synced Day Book"}
          icon={Activity}
          color="slate"
        />
        <KpiCard
          title="Sales less recorded expenses"
          value={formatCurrency(monthlyDifference)}
          subValue="Not a profit calculation"
          icon={TrendingUp}
          color={monthlyDifference >= 0 ? "emerald" : "rose"}
        />
      </div>

      <p className="text-xs text-slate-500">{cash?`Cash row last updated ${siteDateTime(cash.updatedAt)}. Cloud sync completeness is not verified here.`:'Cash is unavailable until a Day Book is synced.'}</p>

      {/* Today's Operations Tracker */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm mt-2">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Operations</h3>
          <Truck className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Recorded dispatches</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{dispatchCount}</span>
            </div>

          </div>


        </div>
      </div>

      {/* Quick Actions / Navigation */}
      <div className="pt-2 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 px-1">Quick Access</h3>
        <Link href="/sales" className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">Outgoing Sales</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">View recent material dispatches</div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </Link>

        <Link href="/boulder" className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-xl">
              <Activity className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">Incoming Boulders</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">View raw material purchases</div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </Link>
      </div>

    </div>
  );
}

function KpiCard({ title, value, subValue, icon: Icon, color = "slate" }: { title: string, value: string | number, subValue: string, icon: React.ComponentType<{className?:string}>, color?: "slate" | "emerald" | "rose" }) {
  const colorMap = {
    slate: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30",
    rose: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/30",
  };

  const textMap = {
    slate: "text-slate-900 dark:text-slate-100",
    emerald: "text-emerald-700 dark:text-emerald-400",
    rose: "text-rose-700 dark:text-rose-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col justify-between h-32">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-xl border ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <div className={`text-xl font-bold tracking-tight ${textMap[color]}`}>{value}</div>
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">{title} &bull; {subValue}</div>
      </div>
    </div>
  );
}
