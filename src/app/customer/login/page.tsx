import { Lock } from 'lucide-react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

async function customerLogin(formData: FormData) {
  'use server'
  const phone = formData.get('phone') as string
  
  if (phone) {
    // In a real app, we would verify the phone number against the Supabase parties table.
    // For this demo, we'll just set a dummy cookie and redirect to the dashboard.
    // Ideally we'd use Supabase auth or fetch the party ID here.
    const cookieStore = await cookies()
    cookieStore.set('customer_phone', phone, { secure: true, httpOnly: true })
    redirect('/customer/dashboard')
  }
}

export default function CustomerLoginPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-2">
            <Lock className="h-6 w-6 text-blue-900" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Customer Portal</h1>
          <p className="text-sm text-slate-500">
            Enter your registered phone number to access your ledger.
          </p>
        </div>
        <div className="grid gap-6">
          <form action={customerLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="phone"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  required
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 w-full mt-2"
              >
                Access Portal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
