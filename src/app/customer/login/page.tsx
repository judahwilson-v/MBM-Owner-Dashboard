// W1: the demo phone-number customer portal was removed for the private
// launch. It set an unverified cookie for any typed number and exposed the
// matching customer's ledger - that surface is intentionally closed.
export default function CustomerLoginPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Customer portal not available</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          This website is private. There is no customer login here.
        </p>
      </div>
    </div>
  )
}
