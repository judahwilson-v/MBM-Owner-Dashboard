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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Incoming Boulder Log</h1>
          <p className="text-slate-500 mt-1 text-sm">Raw material purchases and arrivals.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-slate-200 bg-white hover:bg-slate-50 h-9 px-4 py-2 shadow-sm">
            <Filter className="h-4 w-4 mr-2 text-slate-500" />
            Filter
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-slate-900 text-white hover:bg-slate-800 h-9 px-4 py-2 shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search supplier or vehicle..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Showing {boulders?.length || 0} recent arrivals
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Arrival Date</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Material</th>
                <th className="px-6 py-4 text-right">Qty (Tons/Units)</th>
                <th className="px-6 py-4 text-right">Amount (₹)</th>
                <th className="px-6 py-4 text-center">Settled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-rose-500">
                    Failed to load boulder data: {error.message}
                  </td>
                </tr>
              ) : boulders?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No incoming boulder records found.
                  </td>
                </tr>
              ) : (
                boulders?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-slate-900 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ArrowDownToLine className="h-4 w-4 text-indigo-500" />
                        {format(new Date(item.date), "dd MMM yyyy")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{item.party_name || "Unknown Supplier"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {item.vehicle_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.material_name}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                      {item.qty?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      ₹{item.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        item.settled 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200' 
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
