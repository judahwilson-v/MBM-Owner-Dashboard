import { createClient } from "@/utils/supabase/server";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { 
  TrendingUp, 
  IndianRupee, 
  CreditCard,
  PackageSearch,
  Activity,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { SalesChart } from "@/components/sales-chart";

export default async function DashboardHome() {
  const supabase = await createClient();

  // Get Today's Date Boundaries
  const today = new Date();
  const todayStart = startOfDay(today).toISOString();
  const todayEnd = endOfDay(today).toISOString();

  // 1. Fetch Today's Sales
  const { data: todaySales, error: salesError } = await supabase
    .from("outgoing_sales")
    .select("final_amount, paid_total, remaining_credit")
    .gte("date", todayStart)
    .lte("date", todayEnd);

  // 2. Fetch Today's Purchases
  const { data: todayPurchases, error: purchError } = await supabase
    .from("incoming_boulder")
    .select("amount, paid_total")
    .gte("date", todayStart)
    .lte("date", todayEnd);

  // 3. Fetch Recent Sales Feed
  const { data: recentSales } = await supabase
    .from("outgoing_sales")
    .select("id, date, party_name, material_name, final_amount")
    .order("date", { ascending: false })
    .limit(5);

  // 4. Fetch 7-Day Sales for Chart
  const sevenDaysAgo = subDays(today, 7).toISOString();
  const { data: weekSales } = await supabase
    .from("outgoing_sales")
    .select("date, final_amount")
    .gte("date", sevenDaysAgo)
    .lte("date", todayEnd)
    .order("date", { ascending: true });

  // Calculate KPIs
  const totalSalesAmount = todaySales?.reduce((acc, curr) => acc + (curr.final_amount || 0), 0) || 0;
  const totalCashCollected = todaySales?.reduce((acc, curr) => acc + (curr.paid_total || 0), 0) || 0;
  const totalCreditGiven = todaySales?.reduce((acc, curr) => acc + (curr.remaining_credit || 0), 0) || 0;
  
  const totalPurchasesAmount = todayPurchases?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

  return (
    <div className="flex-1 space-y-8 p-4 pt-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Owner Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time overview of quarry operations.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Sales */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400">Today's Sales</h3>
            <TrendingUp className="h-4 w-4 text-[#f39c12]" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalSalesAmount.toLocaleString()}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Based on {todaySales?.length || 0} invoices</p>
        </div>

        {/* Collection */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400">Cash Collected</h3>
            <IndianRupee className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalCashCollected.toLocaleString()}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cash, Bank, and UPI</p>
        </div>

        {/* Credit */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400">Credit Given</h3>
            <CreditCard className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalCreditGiven.toLocaleString()}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Outstanding from today</p>
        </div>

        {/* Purchases */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400">Today's Purchases</h3>
            <PackageSearch className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalPurchasesAmount.toLocaleString()}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Incoming Boulders</p>
        </div>

      </div>

      {/* Feed & Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Main Content Area (Chart) */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm lg:col-span-4 p-6">
          <h3 className="font-semibold text-lg flex items-center mb-4">
            <Activity className="w-5 h-5 mr-2 text-[#f39c12]" />
            7-Day Sales Volume
          </h3>
          <SalesChart data={weekSales || []} />
        </div>

        {/* Recent Activity Feed */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm lg:col-span-3 p-6">
          <h3 className="font-semibold text-lg mb-6">Recent Sales Activity</h3>
          <div className="space-y-6">
            {recentSales?.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">{sale.party_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {sale.material_name} • {format(new Date(sale.date), "MMM d, h:mm a")}
                  </p>
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  +₹{sale.final_amount.toLocaleString()}
                </div>
              </div>
            ))}
            {(!recentSales || recentSales.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No recent sales found.</p>
            )}
          </div>
          <Link href="/sales" className="mt-6 w-full flex items-center justify-center py-2 text-sm text-[#f39c12] hover:bg-orange-50 dark:hover:bg-gray-800 rounded-md transition-colors">
            View All Sales
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

      </div>
    </div>
  );
}
