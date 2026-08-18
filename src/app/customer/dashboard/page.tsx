import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { LogOut, FileText, User } from 'lucide-react'
import Link from 'next/link'

export default async function CustomerDashboardPage() {
  const cookieStore = await cookies()
  const customerPhone = cookieStore.get('customer_phone')?.value
  
  if (!customerPhone) {
    redirect('/customer/login')
  }

  const supabase = await createClient()
  
  // Try to find the party by phone number
  const { data: party } = await supabase
    .from('parties')
    .select('*')
    .eq('phone', customerPhone)
    .single()
    
  if (!party) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-lg shadow max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Account Not Found</h2>
          <p className="text-slate-600 mb-4">We couldn't find a party associated with this phone number: {customerPhone}</p>
          <Link href="/customer/login" className="text-blue-600 hover:underline">
            Go back to login
          </Link>
        </div>
      </div>
    )
  }

  // Fetch the latest ledger balance
  const { data: ledgerEntries } = await supabase
    .from('party_ledgers')
    .select('*')
    .eq('party_id', party.id)
    .order('created_at', { ascending: false })
    .limit(1)
    
  const currentBalance = ledgerEntries && ledgerEntries.length > 0 ? ledgerEntries[0].balance : 0;
  
  // Fetch recent invoices (outgoing sales)
  const { data: invoices } = await supabase
    .from('outgoing_sales')
    .select('*')
    .eq('party_id', party.id)
    .order('date', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{party.party_name}</h1>
              <p className="text-sm text-slate-500">{party.phone}</p>
            </div>
          </div>
          <form action={async () => {
            'use server'
            const cookieStore = await cookies()
            cookieStore.delete('customer_phone')
            redirect('/customer/login')
          }}>
            <button type="submit" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </form>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Balance Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Current Ledger Balance</h2>
            <div className={`text-4xl sm:text-5xl font-bold ${currentBalance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              ₹{Math.abs(currentBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {currentBalance < 0 ? 'You have an outstanding balance.' : 'Your account is in credit.'}
            </p>
          </div>
        </div>
        
        {/* Recent Invoices */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Invoices</h3>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {invoices && invoices.length > 0 ? (
              <ul className="divide-y divide-slate-200">
                {invoices.map((invoice: any) => (
                  <li key={invoice.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 rounded-md">
                        <FileText className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Invoice #{invoice.invoice_number}</p>
                        <p className="text-sm text-slate-500">{new Date(invoice.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">₹{invoice.total_amount?.toLocaleString('en-IN')}</p>
                      <button className="text-sm text-blue-600 hover:underline mt-1">Download PDF</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500">
                No recent invoices found.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
