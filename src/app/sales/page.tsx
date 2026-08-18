import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { Search, Filter, Download } from "lucide-react";

export default async function SalesPage() {
  const supabase = await createClient();
  
  // Fetch recent sales
  const { data: sales, error } = await supabase
    .from('outgoing_sales')
    .select('*')
    .order('sale_date', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-6">
      <div className="pt-2 pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sales Log</h1>
        <p className="text-slate-500 mt-0.5 text-sm">Recent dispatches</p>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search party or vehicle..." 
            className="w-full pl-9 pr-4 py-2.5 text-[15px] border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
          />
        </div>
        <button className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-600 shrink-0 active:scale-95 transition-transform">
          <Filter className="h-5 w-5" />
        </button>
      </div>
        
      {/* Premium Table Container (Scrollable) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-500 bg-slate-50 uppercase font-bold tracking-wider border-b border-slate-200 whitespace-nowrap">
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
            <tbody className="divide-y divide-slate-100">
              {error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-rose-500 bg-rose-50/50">
                    Failed to load sales data.
                  </td>
                </tr>
              ) : sales?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    No sales recorded yet.
                  </td>
                </tr>
              ) : (
                sales?.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors whitespace-nowrap">
                    <td className="px-4 py-3.5 font-medium text-slate-500">
                      #{sale.serial_number}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {format(new Date(sale.sale_date), "dd MMM yy, h:mm a")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{sale.party_name || "Cash Sale"}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {sale.vehicle_number}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium text-xs">
                      {sale.material_name}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-700">
                      {sale.qty?.toFixed(1)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      ₹{sale.final_amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        sale.remaining_credit > 0 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-emerald-100 text-emerald-700'
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
