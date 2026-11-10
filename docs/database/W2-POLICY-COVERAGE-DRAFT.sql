-- DRAFT, NOT EXECUTED. Depends on W1 proposed membership table.
-- Do NOT apply blindly. First inventory current grants, column grants, views,
-- functions, policies, table ownership, BYPASSRLS and service-role usage.
-- Existing permissive policies combine by OR. A new restrictive policy is
-- therefore required, not merely another permissive membership policy.
-- All public/signed-in writes to these read-only website surfaces must stop.
-- Existing legitimate clients must be reconciled before approval/execution.
DO $$
DECLARE tab text;
BEGIN
 FOREACH tab IN ARRAY ARRAY['outgoing_sales','incoming_boulder','expenses','day_books','global_settings'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',tab);
  EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated',tab);
  EXECUTE format('CREATE POLICY website_private_select ON public.%I AS RESTRICTIVE FOR SELECT TO anon,authenticated USING (EXISTS (SELECT 1 FROM public.website_approver_principals p WHERE p.supabase_user_id=auth.uid() AND p.active))',tab);
  EXECUTE format('CREATE POLICY website_members_select ON public.%I FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.website_approver_principals p WHERE p.supabase_user_id=auth.uid() AND p.active))',tab);
  -- Restrictive false additionally blocks prior permissive write policies.
  EXECUTE format('CREATE POLICY website_no_insert ON public.%I AS RESTRICTIVE FOR INSERT TO anon,authenticated WITH CHECK (false)',tab);
  EXECUTE format('CREATE POLICY website_no_update ON public.%I AS RESTRICTIVE FOR UPDATE TO anon,authenticated USING (false) WITH CHECK (false)',tab);
  EXECUTE format('CREATE POLICY website_no_delete ON public.%I AS RESTRICTIVE FOR DELETE TO anon,authenticated USING (false)',tab);
 END LOOP;
END $$;
-- Column-level SELECT only, especially global_settings which can carry secrets.
-- No SELECT * permission is needed for any current website query.
GRANT SELECT(id,sale_date,book_number,page_number,serial_number,party_name,vehicle_number,material_name,qty,final_amount,remaining_credit) ON public.outgoing_sales TO authenticated;
GRANT SELECT(id,date,party_name,vehicle_number,material_name,qty,amount,settled) ON public.incoming_boulder TO authenticated;
GRANT SELECT(id,amount,expense_date) ON public.expenses TO authenticated;
GRANT SELECT(closing_cash_balance,business_date,updated_at) ON public.day_books TO authenticated;
GRANT SELECT(quarry_name) ON public.global_settings TO authenticated;
-- WARNING: REVOKE ALL at TABLE level does not necessarily remove historical
-- COLUMN grants. Inspect and explicitly revoke every old column grant, then
-- grant ONLY the allowlist above. This draft is not executable acceptance of
-- unknown current grants. Existing security-definer functions, exposed views,
-- inherited roles and other public-schema tables must be inventoried too.
