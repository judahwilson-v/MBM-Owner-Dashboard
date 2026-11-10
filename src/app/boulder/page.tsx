import {loadSiteLog,siteDateTime} from "@/lib/erp-read-contract";
import { createClient } from "@/utils/supabase/server";
import { ArrowDownToLine } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";

export default async function BoulderPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const dateStr=typeof searchParams.date==='string'?searchParams.date:undefined;
  const term=typeof searchParams.q==='string'?searchParams.q:'';
  const result=await loadSiteLog(await createClient(),'boulders',dateStr,term);
  if(result.status==='invalid-date')return <div role="alert" className="p-5">Invalid date. Choose a valid calendar date.</div>;
  if(result.status==='unavailable')return <div role="alert" className="rounded-xl border border-amber-300 p-5">Records unavailable. No partial or zero totals are substituted. Choose a narrower date if the list is too large.</div>;
  const boulders=result.rows;
  const totalAmount=result.totalAmount,totalQty=result.totalQty;
  const totalCount=boulders.length;
  const filterDisplay=dateStr?`Arrivals for ${dateStr}`:'Latest 50 records only, not all-time totals';
  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-6">
      <div className="pt-2 pb-2 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Boulders</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">{filterDisplay}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <DatePicker />
        <form method="get" className="flex min-w-0 flex-1 items-center gap-2">
          {dateStr && <input type="hidden" name="date" value={dateStr} />}
          <input
            type="search" name="q" defaultValue={term} aria-label="Search loaded records by party name"
            placeholder="Supplier name"
            className="w-full min-w-0 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 shadow-sm transition-all"
          />
          <button type="submit" className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-white">Search</button>
        </form>
      </div>
      <p className="text-xs text-slate-500">{dateStr?'Totals cover the selected day.':'Totals cover only the latest 50 records.'} Search filters that scope. {term.trim() && `Matching party name: ${term.trim()}.`} {result.loadedCount} {result.loadedCount===1?'record':'records'} loaded.</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase">Matching Entries</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase">Matching Qty</p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{totalQty.toFixed(1)} Tons</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase">Matching Amount</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{totalAmount.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
        </div>
      </div>

      {boulders.length===0 && <p role="status" className="rounded-xl border border-slate-200 p-5 text-sm text-slate-500">No incoming boulder records found.</p>}
      {/* Premium Table Container (Scrollable) */}
      <div hidden={boulders.length===0} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col mt-2">
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
              {boulders?.length === 0 ? (
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
                        {siteDateTime(item.date!)}
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
                      ₹{item.amount?.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}
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
