import { createClient } from "@/utils/supabase/server";
import { Activity, CreditCard, DollarSign, Users, TrendingUp, BarChart3, Truck } from "lucide-react";
import React from "react";

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

  // 4. Query Active Parties
  const { count: partiesCount } = await supabase
    .from('parties')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
        <p className="text-slate-500 mt-1">Real-time financial and operational metrics.</p>
      </div>
      
      {/* KPI Cards (Tremor Style) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Today's Sales" 
          value={formatCurrency(todaysSales)} 
          subValue={`${todaysQty.toFixed(0)} CFT dispatched`}
          icon={DollarSign} 
        />
        <KpiCard 
          title="Monthly P/L" 
          value={formatCurrency(monthlyPL)} 
          subValue={monthlyPL >= 0 ? "Profitable" : "Operating at loss"}
          icon={TrendingUp} 
          trend={monthlyPL >= 0 ? 'up' : 'down'}
        />
        <KpiCard 
          title="Cash Position" 
          value={formatCurrency(cashPosition)} 
          subValue="Available cash in hand"
          icon={Activity} 
        />
        <KpiCard 
          title="Active Parties" 
          value={partiesCount?.toString() || "0"} 
          subValue="Total registered accounts"
          icon={Users} 
        />
      </div>

      {/* Charts / Secondary Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-7 mt-8">
        <div className="md:col-span-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Monthly Revenue vs Expenses</h3>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-[300px] w-full flex items-end gap-8 pb-6 pt-10 px-4 border-b border-l border-slate-100">
            {/* Very simple mock chart for aesthetic purposes since Recharts needs client components */}
            <div className="w-full relative h-full flex items-end group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded">
                {formatCurrency(monthlyRevenue)}
              </div>
              <div className="w-full bg-blue-500 rounded-t-sm" style={{ height: '100%' }}></div>
            </div>
            <div className="w-full relative h-full flex items-end group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded">
                {formatCurrency(monthlyExpenses)}
              </div>
              <div className="w-full bg-rose-400 rounded-t-sm" style={{ height: `${(monthlyExpenses / (monthlyRevenue || 1)) * 100}%`, minHeight: '10%' }}></div>
            </div>
          </div>
          <div className="flex justify-around mt-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div> Revenue
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div> Expenses
            </div>
          </div>
        </div>

        <div className="md:col-span-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
           <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Today's Operations</h3>
            <Truck className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-6 mt-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Vehicle Trips</span>
                <span className="font-medium">{todaysSalesData?.length || 0} trips</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Production Estimate</span>
                <span className="font-medium">{formatCurrency(todaysQty * 0.8)} tons</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subValue, icon: Icon, trend }: { title: string, value: string | number, subValue: string, icon: any, trend?: 'up' | 'down' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden group">
      {/* Subtle top border accent */}
      <div className={`absolute top-0 left-0 w-full h-1 ${trend === 'down' ? 'bg-rose-500' : 'bg-blue-600'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-500 tracking-tight">{title}</h3>
        <div className="p-2 bg-slate-50 rounded-lg">
          <Icon className={`h-5 w-5 ${trend === 'down' ? 'text-rose-500' : 'text-slate-600'}`} />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
        <p className={`text-xs mt-1 font-medium ${trend === 'down' ? 'text-rose-600' : 'text-slate-500'}`}>
          {subValue}
        </p>
      </div>
    </div>
  );
}
