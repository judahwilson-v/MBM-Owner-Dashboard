import { createClient } from "@/utils/supabase/server";
import { Activity, CreditCard, DollarSign, Users, TrendingUp, Truck, ChevronRight } from "lucide-react";
import React from "react";
import Link from "next/link";

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStartStr = today.toISOString();
  
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartStr = monthStart.toISOString();

  // 1. Query Today's Sales
  const { data: todaysSalesData } = await supabase
    .from('outgoing_sales')
    .select('final_amount, qty')
    .gte('sale_date', todayStartStr);
    
  const todaysSales = todaysSalesData?.reduce((sum, sale) => sum + (sale.final_amount || 0), 0) || 0;
  const todaysQty = todaysSalesData?.reduce((sum, sale) => sum + (sale.qty || 0), 0) || 0;

  // 2. Query Monthly P/L
  const { data: monthlySalesData } = await supabase
    .from('outgoing_sales')
    .select('final_amount')
    .gte('sale_date', monthStartStr);
  const monthlyRevenue = monthlySalesData?.reduce((sum, sale) => sum + (sale.final_amount || 0), 0) || 0;
  
  const { data: monthlyExpensesData } = await supabase
    .from('expenses')
    .select('amount')
    .gte('expense_date', monthStartStr);
  const monthlyExpenses = monthlyExpensesData?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
  
  const monthlyPL = monthlyRevenue - monthlyExpenses;

  // 3. Query Cash Position
  const { data: latestDayBook } = await supabase
    .from('day_books')
    .select('closing_cash_balance')
    .order('business_date', { ascending: false })
    .limit(1)
    .single();
    
  const cashPosition = latestDayBook?.closing_cash_balance || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-6">
      
      {/* Mobile Greeting */}
      <div className="pt-2 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
        <p className="text-slate-500 mt-0.5 text-sm">Today's live metrics</p>
      </div>
      
      {/* Primary KPI: Today's Sales (Hero Card) */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 to-blue-700 p-6 shadow-lg shadow-indigo-600/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="flex items-center justify-between relative z-10">
          <h3 className="text-indigo-100 font-medium text-sm">Today's Sales</h3>
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-4 relative z-10">
          <div className="text-4xl font-bold tracking-tight">{formatCurrency(todaysSales)}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-medium text-emerald-200 border border-emerald-400/30">
              <TrendingUp className="mr-1 h-3 w-3" /> Live
            </span>
            <span className="text-indigo-200 text-xs">{todaysQty.toFixed(0)} CFT dispatched</span>
          </div>
        </div>
      </div>

      {/* Secondary KPIs Grid (2 Columns on Mobile) */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard 
          title="Cash Position" 
          value={formatCurrency(cashPosition)} 
          subValue="Available cash"
          icon={Activity} 
          color="slate"
        />
        <KpiCard 
          title="Monthly P/L" 
          value={formatCurrency(Math.abs(monthlyPL))} 
          subValue={monthlyPL >= 0 ? "Profit" : "Loss"}
          icon={monthlyPL >= 0 ? TrendingUp : TrendingUp} 
          color={monthlyPL >= 0 ? "emerald" : "rose"}
        />
      </div>

      {/* Today's Operations Tracker */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mt-2">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900">Operations</h3>
          <Truck className="h-4 w-4 text-slate-400" />
        </div>
        
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-500 font-medium">Vehicle Trips</span>
              <span className="font-bold text-slate-900">{todaysSalesData?.length || 0}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-500 font-medium">Est. Production</span>
              <span className="font-bold text-slate-900">{formatCurrency(todaysQty * 0.8)} tons</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions / Navigation */}
      <div className="pt-2 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 px-1">Quick Access</h3>
        <Link href="/sales" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Truck className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">Outgoing Sales</div>
              <div className="text-xs text-slate-500">View recent material dispatches</div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </Link>

        <Link href="/boulder" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-xl">
              <Activity className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">Incoming Boulders</div>
              <div className="text-xs text-slate-500">View raw material purchases</div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </Link>
      </div>

    </div>
  );
}

function KpiCard({ title, value, subValue, icon: Icon, color = "slate" }: { title: string, value: string | number, subValue: string, icon: any, color?: "slate" | "emerald" | "rose" }) {
  const colorMap = {
    slate: "text-slate-600 bg-slate-50 border-slate-200",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
    rose: "text-rose-600 bg-rose-50 border-rose-200",
  };
  
  const textMap = {
    slate: "text-slate-900",
    emerald: "text-emerald-700",
    rose: "text-rose-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between h-32">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-xl border ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <div className={`text-xl font-bold tracking-tight ${textMap[color]}`}>{value}</div>
        <div className="text-[11px] font-medium text-slate-500 mt-0.5">{title} &bull; {subValue}</div>
      </div>
    </div>
  );
}
