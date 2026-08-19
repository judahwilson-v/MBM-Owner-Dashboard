import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { Search, Filter, Download } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";

export default async function SalesPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const dateStr = typeof searchParams.date === 'string' ? searchParams.date : undefined;

  const supabase = await createClient();
  
  let query = supabase
    .from('outgoing_sales')
    .select('*')
    .order('sale_date', { ascending: false });

  let filterDisplay = "Recent dispatches";
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    // Treat as IST (+05:30) timezone boundaries since currency is INR
    const startIso = `${dateStr}T00:00:00+05:30`;
    const endIso = `${dateStr}T23:59:59.999+05:30`;
    
    query = query.gte('sale_date', startIso).lte('sale_date', endIso);
    
    // Format for display
    const [year, month, day] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    filterDisplay = `Dispatches for ${months[parseInt(month) - 1]} ${day}, ${year}`;
  } else {
    query = query.limit(50);
  }

  const { data: sales, error } = await query;

  // Aggregates
  const totalSales = sales?.length || 0;
  const totalAmount = sales?.reduce((sum, s) => sum + (s.final_amount || 0), 0) || 0;
  const totalQty = sales?.reduce((sum, s) => sum + (s.qty || 0), 0) || 0;
  
  const materialAgg = sales?.reduce((acc: any, s: any) => {
    const mat = s.material_name || 'Other';
    acc[mat] = (acc[mat] || 0) + (s.qty || 0);
    return acc;
  }, {});

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-6">
      <div className="pt-2 pb-2 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Sales Log</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">{filterDisplay}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <DatePicker />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Search party..." 
            className="w-full pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase">Total Sales</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalSales}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase">Total Amount</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{totalAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase">Total Qty</p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{totalQty.toFixed(1)} CFT</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm overflow-hidden">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase">Materials</p>
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5 space-y-0.5">
            {Object.keys(materialAgg || {}).length === 0 && <span>-</span>}
            {Object.entries(materialAgg || {}).slice(0, 2).map(([mat, qty]: any) => (
              <div key={mat} className="flex justify-between">
                <span className="truncate pr-1">{mat}</span>
                <span>{qty.toFixed(0)}</span>
              </div>
            ))}
            {Object.keys(materialAgg || {}).length > 2 && (
               <div className="text-[10px] text-slate-400">+{Object.keys(materialAgg || {}).length - 2} more...</div>
            )}
          </div>
        </div>
      </div>
        
      {/* Premium Table Container (Scrollable) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
              <tr>
                <th className="px-4 py-3">S.No</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Party Name</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3 text-right">Qty (CFT)</th>
                <th className="px-4 py-3 text-right">Amount (₹)</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-rose-500 bg-rose-50/50 dark:bg-rose-900/10">
                    Failed to load sales data.
                  </td>
                </tr>
              ) : sales?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No sales recorded yet.
                  </td>
                </tr>
              ) : (
                sales?.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors whitespace-nowrap">
                    <td className="px-4 py-3.5 font-medium text-slate-500 dark:text-slate-400">
                      #{sale.serial_number}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {format(new Date(sale.sale_date), "dd MMM yy, h:mm a")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{sale.party_name || "Cash Sale"}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {sale.vehicle_number}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-medium text-xs">
                      {sale.material_name}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-700 dark:text-slate-200">
                      {sale.qty?.toFixed(1)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-slate-100">
                      ₹{sale.final_amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        sale.remaining_credit > 0 
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' 
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {sale.remaining_credit > 0 ? 'Credit' : 'Paid'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
