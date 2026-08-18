-- Enable RLS on tables if not already enabled
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE outgoing_sales ENABLE ROW LEVEL SECURITY;

-- Note: Since we are using a dummy "phone number" login that doesn't actually log the user into Supabase Auth (for demo purposes),
-- the Next.js server-side client likely uses the service_role key to fetch data. 
-- In a production environment with real Supabase Auth, you would write policies like this:

/*
CREATE POLICY "Parties can view their own record" ON parties
  FOR SELECT USING (
    auth.uid() = id -- assuming party id maps to auth user id
  );

CREATE POLICY "Parties can view their own ledger" ON party_ledgers
  FOR SELECT USING (
    party_id = auth.uid()
  );

CREATE POLICY "Parties can view their own invoices" ON outgoing_sales
  FOR SELECT USING (
    party_id = auth.uid()
  );
*/
