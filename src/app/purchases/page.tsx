import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { ArrowLeft, Search, LogIn } from "lucide-react";
import Link from "next/link";
import { ExportButtons } from "@/components/export-buttons";

export default async function PurchasesPage() {
  const supabase = await createClient();

  // Fetch last 100 purchases
  const { data: purchases, error } = await supabase
    .from("incoming_boulder")
    .select("id, date, supplier_name, amount, paid_total, remaining_credit")
    .order("date", { ascending: false })
    .limit(100);

  const exportColumns = [
    { header: "Date", key: "date" },
    { header: "Supplier Name", key: "supplier_name" },
    { header: "Amount", key: "amount", isCurrency: true },
    { header: "Paid", key: "paid_total", isCurrency: true },
    { header: "Pending Payables", key: "remaining_credit", isCurrency: true }
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
              <LogIn className="w-6 h-6 text-blue-500" />
              Incoming Boulders (Purchases)
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">View the last 100 raw material purchases (Read-Only).</p>
          </div>
        </div>
        <ExportButtons data={purchases || []} columns={exportColumns} filename="MBM_Purchases" title="Incoming Purchases" />
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search purchases (Coming soon)..."
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
                <th className="px-6 py-3">Supplier Name</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Paid</th>
                <th className="px-6 py-3 text-right">Pending Payables</th>
              </tr>
            </thead>
            <tbody>
              {purchases?.map((purch) => (
                <tr key={purch.id} className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {format(new Date(purch.date), "dd MMM yyyy, h:mm a")}
                  </td>
                  <td className="px-6 py-4">{purch.supplier_name}</td>
                  <td className="px-6 py-4 text-right font-medium">₹{purch.amount?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">₹{purch.paid_total?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    {purch.remaining_credit > 0 ? (
                      <span className="text-rose-500 font-medium">₹{purch.remaining_credit.toLocaleString()}</span>
                    ) : (
                      <span className="text-emerald-500">Settled</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!purchases || purchases.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No purchases found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
