import {login} from './actions'
export default async function LoginPage({searchParams}:{searchParams:Promise<{error?:string}>}){
 const params=await searchParams
 return <main className="min-h-screen bg-stone-50 text-stone-950 flex items-center justify-center p-6">
  <section className="w-full max-w-sm" aria-labelledby="owner-login-title">
   <p className="text-xs font-semibold tracking-widest text-stone-500 uppercase mb-8">MBM Quarry</p>
   <h1 id="owner-login-title" className="text-3xl font-semibold tracking-tight">Owner sign in</h1>
   <p className="text-sm text-stone-600 mt-3 mb-8">Review saved quarry records and approval requests.</p>
   <form action={login} className="space-y-5">
    <div><label htmlFor="username" className="block text-sm font-medium mb-2">Owner username</label>
     <input id="username" name="username" type="text" autoComplete="username" autoCapitalize="none" autoCorrect="off" required maxLength={32}
      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:ring-2 focus:ring-stone-700 focus:ring-offset-2"/>
    </div>
    <div><label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
     <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={4096}
      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:ring-2 focus:ring-stone-700 focus:ring-offset-2"/>
    </div>
    {params.error&&<p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-900">Could not authenticate owner. Check your username and password.</p>}
    <button type="submit" className="w-full rounded-lg bg-stone-900 px-4 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-stone-700 focus:ring-offset-2 hover:bg-stone-800">Sign in</button>
   </form>
   <p className="mt-8 text-xs leading-5 text-stone-500">Private owner access. Employee ERP logins are separate.</p>
  </section>
 </main>
}
