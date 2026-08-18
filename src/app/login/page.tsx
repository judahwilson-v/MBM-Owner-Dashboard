import { login } from './actions'
import { Activity, ShieldCheck, ArrowRight } from 'lucide-react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-950 font-sans selection:bg-indigo-500/30 selection:text-white relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -left-32 h-96 w-96 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none" />

      <div className="flex flex-1 flex-col justify-center px-6 py-12 relative z-10 w-full max-w-md mx-auto">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/20 mb-6">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">MBM Analytics</h1>
          <p className="text-zinc-400 text-sm">Owner Authorization Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <form action={login} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider pl-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="owner@mbmquarry.com"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                required
                className="block w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3.5 text-[15px] text-white transition-all placeholder:text-zinc-500 focus:border-indigo-500 focus:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider pl-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3.5 text-[15px] text-white transition-all placeholder:text-zinc-500 focus:border-indigo-500 focus:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                placeholder="••••••••"
              />
            </div>
            
            {searchParams?.error && (
              <div className="rounded-xl bg-rose-500/10 p-4 border border-rose-500/20">
                <div className="flex items-center">
                  <div className="ml-2">
                    <h3 className="text-sm font-medium text-rose-400">Authentication Failed</h3>
                    <div className="mt-0.5 text-xs text-rose-400/80">{searchParams.error}</div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-white px-4 py-3.5 text-[15px] font-semibold text-zinc-900 transition-all hover:bg-zinc-100 hover:shadow-lg hover:shadow-white/10 active:scale-[0.98] mt-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                Access Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </form>
        </div>
        
        {/* Footer Security Badges */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 text-xs font-medium text-zinc-500 animate-in fade-in duration-700 delay-300 fill-mode-both">
          <div className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>End-to-End Encrypted</span>
          </div>
          <p className="text-center text-zinc-600">
            Unauthorized access is strictly logged and prohibited.
          </p>
        </div>

      </div>
    </div>
  )
}

