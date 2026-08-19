import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { Search, Filter, Download, ArrowDownToLine } from "lucide-react";

export default async function BoulderPage() {
  const supabase = await createClient();
  
  // Fetch recent incoming boulders
  const { data: boulders, error } = await supabase
    .from('incoming_boulder')
    .select('*')
    .order('date', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-6">
      <div className="pt-2 pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Boulders</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">Raw material arrivals</p>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Search supplier or vehicle..." 
            className="w-full pl-9 pr-4 py-2.5 text-[15px] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 shadow-sm transition-all"
          />
        </div>
        <button className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0 active:scale-95 transition-transform">
          <Filter className="h-5 w-5" />
        </button>
      </div>
        
      {/* Premium Table Container (Scrollable) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
              <tr>
                <th className="px-4 py-3">Arrival Date</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3 text-right">Qty (Tons)</th>
                <th className="px-4 py-3 text-right">Amount (₹)</th>
                <th className="px-4 py-3 text-center">Settled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-rose-500 bg-rose-50/50 dark:bg-rose-900/10">
                    Failed to load boulder data.
                  </td>
                </tr>
              ) : boulders?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No incoming boulder records found.
                  </td>
                </tr>
              ) : (
                boulders?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors whitespace-nowrap">
                    <td className="px-4 py-3.5 text-slate-900 dark:text-slate-100 font-medium">
                      <div className="flex items-center gap-2">
                        <ArrowDownToLine className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                        {format(new Date(item.date), "dd MMM yy")}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{item.party_name || "Unknown"}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {item.vehicle_number}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-medium text-xs">
                      {item.material_name}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-700 dark:text-slate-200">
                      {item.qty?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-slate-100">
                      ₹{item.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        item.settled 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' 
                      }`}>
                        {item.settled ? 'Yes' : 'No'}
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
