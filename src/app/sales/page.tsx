import {loadSiteLog,siteDateTime} from "@/lib/erp-read-contract";
import { createClient } from "@/utils/supabase/server";
import { DatePicker } from "@/components/DatePicker";

export default async function SalesPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const dateStr=typeof searchParams.date==='string'?searchParams.date:undefined;
  const term=typeof searchParams.q==='string'?searchParams.q:'';
  const result=await loadSiteLog(await createClient(),'sales',dateStr,term);
  if(result.status==='invalid-date')return <div role="alert" className="p-5">Invalid date. Choose a valid calendar date.</div>;
  if(result.status==='unavailable')return <div role="alert" className="rounded-xl border border-amber-300 p-5">Records unavailable. No partial or zero totals are substituted. Choose a narrower date if the list is too large.</div>;
  const sales=result.rows;
  const totalAmount=result.totalAmount,totalQty=result.totalQty;
  const totalSales=sales.length;
  const filterDisplay=dateStr?`Dispatches for ${dateStr}`:'Latest 50 records only, not all-time totals';
  const materialAgg = sales.reduce((acc:Record<string,number>, row)=>{const name=row.material_name||'Other';acc[name]=(acc[name]||0)+row.qty;return acc;},{});
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
        <form method="get" className="flex min-w-0 flex-1 items-center gap-2">
          {dateStr && <input type="hidden" name="date" value={dateStr} />}
          <input
            type="search" name="q" defaultValue={term} aria-label="Search loaded records by party name"
            placeholder="Party name"
            className="w-full min-w-0 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
          />
          <button type="submit" className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-white">Search</button>
        </form>
      </div>
      <p className="text-xs text-slate-500">{dateStr?'Totals cover the selected day.':'Totals cover only the latest 50 records.'} Search filters that scope. {term.trim() && `Matching party name: ${term.trim()}.`} {result.loadedCount} {result.loadedCount===1?'record':'records'} loaded.</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase">Matching Sales</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalSales}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase">Matching Amount</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{totalAmount.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase">Matching Qty</p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{totalQty.toFixed(1)} CFT</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm overflow-hidden">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase">Materials</p>
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5 space-y-0.5">
            {Object.keys(materialAgg || {}).length === 0 && <span>-</span>}
            {Object.entries(materialAgg || {}).slice(0, 2).map(([mat, qty]) => (
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

      {sales.length===0 && <p role="status" className="rounded-xl border border-slate-200 p-5 text-sm text-slate-500">No sales match this view.</p>}
      {/* Premium Table Container (Scrollable) */}
      <div hidden={sales.length===0} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col mt-2">
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
              {sales?.length === 0 ? (
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
                      {siteDateTime(sale.sale_date!)}
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
                      ₹{sale.final_amount?.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        (sale.remaining_credit ?? 0) > 0
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {(sale.remaining_credit ?? 0) > 0 ? 'Credit' : 'Paid'}
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
