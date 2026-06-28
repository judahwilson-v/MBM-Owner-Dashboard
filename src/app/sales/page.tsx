import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { ArrowLeft, Search, LogOut } from "lucide-react";
import Link from "next/link";
import { ExportButtons } from "@/components/export-buttons";

export default async function SalesPage() {
  const supabase = await createClient();

  // Fetch last 100 sales for the table
  const { data: sales, error } = await supabase
    .from("outgoing_sales")
    .select("id, date, party_name, material_name, qty, final_amount, remaining_credit")
    .order("date", { ascending: false })
    .limit(100);

  const exportColumns = [
    { header: "Date", key: "date" },
    { header: "Customer", key: "party_name" },
    { header: "Material", key: "material_name" },
    { header: "Qty", key: "qty" },
    { header: "Amount", key: "final_amount", isCurrency: true },
    { header: "Pending Credit", key: "remaining_credit", isCurrency: true }
  ];

  return (
    <div className="flex-1 space-y-8 p-4 pt-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <LogOut className="w-6 h-6 text-[#f39c12]" />
              Outgoing Sales
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">View the last 100 sales transactions (Read-Only).</p>
          </div>
        </div>
        <ExportButtons data={sales || []} columns={exportColumns} filename="MBM_Sales" title="Outgoing Sales" />
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search sales (Coming soon)..."
              disabled
              className="w-full pl-9 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm opacity-50 cursor-not-allowed"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 uppercase border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Material</th>
                <th className="px-6 py-3">Qty</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Pending Credit</th>
              </tr>
            </thead>
            <tbody>
              {sales?.map((sale) => (
                <tr key={sale.id} className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {format(new Date(sale.date), "dd MMM yyyy, h:mm a")}
                  </td>
                  <td className="px-6 py-4">{sale.party_name}</td>
                  <td className="px-6 py-4">{sale.material_name}</td>
                  <td className="px-6 py-4">{sale.qty}</td>
                  <td className="px-6 py-4 text-right font-medium">₹{sale.final_amount?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    {sale.remaining_credit > 0 ? (
                      <span className="text-rose-500 font-medium">₹{sale.remaining_credit.toLocaleString()}</span>
                    ) : (
                      <span className="text-emerald-500">Settled</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!sales || sales.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No sales records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
