import { login } from './actions'
import { Activity, ShieldCheck, ArrowRight } from 'lucide-react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="flex min-h-screen w-full bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Left Panel: Branding / Visual (Hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-zinc-950 p-12 text-white lg:flex overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-50">MBM Analytics</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl mb-6 leading-tight">
            Command central for your quarry operations.
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Real-time financial synchronization, operational oversight, and absolute data sovereignty. Securely access your live production metrics from anywhere.
          </p>
          
          <div className="mt-10 flex items-center gap-4 text-sm font-medium text-zinc-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>End-to-End Encrypted</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>Owner Access Only</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex w-full flex-col justify-center px-4 sm:px-6 lg:w-1/2 lg:px-16 xl:px-24 bg-white relative">
        <div className="mx-auto w-full max-w-sm sm:max-w-md">
          
          {/* Mobile Header (Only visible on small screens) */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">MBM Analytics</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Secure Sign In</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Enter your authorized owner credentials to access the live dashboard.
            </p>
          </div>

          <form action={login} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                placeholder="owner@mbmquarry.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                required
                className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                placeholder="••••••••"
              />
            </div>
            
            {searchParams?.error && (
              <div className="rounded-lg bg-rose-50 p-4 border border-rose-100">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-rose-800">Authentication Failed</h3>
                    <div className="mt-1 text-sm text-rose-700">{searchParams.error}</div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800 hover:shadow-md hover:shadow-zinc-900/20 active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Access Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </form>
          
          <div className="mt-10 text-center">
            <p className="text-xs text-zinc-400">
              By signing in, you agree to the MBM Quarry internal data access policies. <br/> Unauthorized access is strictly logged and prohibited.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

