import { createClient } from "@/utils/supabase/server";
import { Activity, CreditCard, DollarSign, LogOut, Users } from "lucide-react";
import { logout } from "./login/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Get the current logged-in user
  const { data: { user } } = await supabase.auth.getUser();

  // Verify connection by querying global_settings
  const { data: globalSettings, error } = await supabase
    .from("global_settings")
    .select("quarry_name")
    .limit(1)
    .single();

  const isConnected = !error && globalSettings;
  const quarryName = globalSettings?.quarry_name || "MBM Quarry";

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Owner Dashboard - {quarryName}</h2>
          {user && (
            <p className="text-muted-foreground text-slate-500 mt-1">
              Welcome back, {user.email}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isConnected ? '🟢 Sync Connected' : '🔴 Sync Error'}
          </div>
          
          <form action={logout}>
            <button 
              type="submit" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 border border-slate-300 bg-white hover:bg-slate-100 h-9 px-4 py-2"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
        <div className="rounded-xl border bg-white text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Today's Sales</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">₹0.00</div>
          <p className="text-xs text-muted-foreground text-slate-500">
            Pending implementation
          </p>
        </div>
        
        <div className="rounded-xl border bg-white text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Monthly P/L</h3>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">₹0.00</div>
          <p className="text-xs text-muted-foreground text-slate-500">
            Pending implementation
          </p>
        </div>
        
        <div className="rounded-xl border bg-white text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Cash Position</h3>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">₹0.00</div>
          <p className="text-xs text-muted-foreground text-slate-500">
            Pending implementation
          </p>
        </div>
        
        <div className="rounded-xl border bg-white text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Active Parties</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground text-slate-500">
            Pending implementation
          </p>
        </div>
      </div>
      
      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <h4 className="font-bold">Database Connection Error</h4>
          <p className="text-sm mt-1">{error.message}</p>
          <p className="text-sm mt-1 text-red-600">Please check your Supabase credentials in .env.local and ensure the database is running.</p>
        </div>
      )}
    </div>
  );
}
