import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { Search, Filter, Download } from "lucide-react";

export default async function SalesPage() {
  const supabase = await createClient();
  
  // Fetch recent sales (limit 50 for demo purposes, in real app add pagination)
  const { data: sales, error } = await supabase
    .from('outgoing_sales')
    .select('*')
    .order('sale_date', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Outgoing Sales Log</h1>
          <p className="text-slate-500 mt-1 text-sm">Real-time feed of all material dispatched from the quarry.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-slate-200 bg-white hover:bg-slate-50 h-9 px-4 py-2 shadow-sm">
            <Filter className="h-4 w-4 mr-2 text-slate-500" />
            Filter
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 py-2 shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by party, vehicle or serial..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Showing {sales?.length || 0} recent transactions
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Party Details</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Material</th>
                <th className="px-6 py-4 text-right">Qty (CFT)</th>
                <th className="px-6 py-4 text-right">Amount (₹)</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-rose-500">
                    Failed to load sales data: {error.message}
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
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      #{sale.serial_number}
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {format(new Date(sale.sale_date), "dd MMM yyyy, HH:mm")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{sale.party_name || "Cash Sale"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {sale.vehicle_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {sale.material_name}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                      {sale.qty?.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      ₹{sale.final_amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        sale.remaining_credit > 0 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
