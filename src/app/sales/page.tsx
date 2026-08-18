import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { Search, Filter, ArrowRight, Truck } from "lucide-react";

export default async function SalesPage() {
  const supabase = await createClient();
  
  // Fetch recent sales
  const { data: sales, error } = await supabase
    .from('outgoing_sales')
    .select('*')
    .order('sale_date', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-4">
      <div className="pt-2 pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sales Log</h1>
        <p className="text-slate-500 mt-0.5 text-sm">Recent dispatches</p>
      </div>

      {/* Mobile Search/Filter Bar */}
      <div className="flex items-center gap-2 sticky top-16 z-30 bg-slate-50 py-2 -mx-4 px-4">
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
        
      {/* Mobile Feed */}
      <div className="space-y-3 mt-4">
        {error ? (
          <div className="p-6 text-center text-rose-500 bg-rose-50 rounded-2xl border border-rose-100">
            Failed to load data
          </div>
        ) : sales?.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            No sales recorded yet.
          </div>
        ) : (
          sales?.map((sale) => (
            <div key={sale.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 relative overflow-hidden active:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">
                    {sale.party_name || "Cash Sale"}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {format(new Date(sale.sale_date), "dd MMM, h:mm a")} &bull; #{sale.serial_number}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  sale.remaining_credit > 0 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {sale.remaining_credit > 0 ? 'Credit' : 'Paid'}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md text-xs font-medium text-slate-700">
                  <Truck className="h-3.5 w-3.5" />
                  {sale.vehicle_number}
                </div>
                <div className="bg-slate-100 px-2 py-1 rounded-md text-xs font-medium text-slate-700">
                  {sale.material_name}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Quantity</span>
                  <div className="font-semibold text-slate-700">{sale.qty?.toFixed(1)} CFT</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium">Amount</span>
                  <div className="font-bold text-slate-900 text-lg leading-none mt-0.5">
                    ₹{sale.final_amount?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
