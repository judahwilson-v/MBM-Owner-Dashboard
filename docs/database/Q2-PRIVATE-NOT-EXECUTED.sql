BEGIN;
CREATE TABLE public.website_approver_principals (
  supabase_user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  principal_id text NOT NULL UNIQUE,
  display_name text NOT NULL,
  active boolean NOT NULL DEFAULT false
);
CREATE TABLE public.website_change_requests (
  id text PRIMARY KEY, sale_context jsonb, entity_name text NOT NULL, entity_id text NOT NULL,
  operation text NOT NULL, original_value text, proposed_value text, reason text NOT NULL,
  status text NOT NULL, requested_by_id text, requested_by_name text NOT NULL,
  decided_by_id text, decided_by_name text, decision_note text,
  created_at timestamptz NOT NULL, decided_at timestamptz, applied_at timestamptz
);
CREATE TABLE public.website_decision_intents (
  sequence bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL,
  issuer_user_id uuid NOT NULL REFERENCES auth.users(id),
  request_id text NOT NULL REFERENCES public.website_change_requests(id),
  approve boolean NOT NULL, note text CHECK (length(note) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  claim_fence uuid, claim_until timestamptz,
  acknowledged_at timestamptz, result jsonb,
  UNIQUE(issuer_user_id, submission_id)
);
CREATE UNIQUE INDEX website_one_unfinished_decision_per_request
 ON public.website_decision_intents(request_id) WHERE acknowledged_at IS NULL;
ALTER TABLE public.website_approver_principals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_decision_intents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.website_approver_principals,public.website_change_requests,public.website_decision_intents FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.website_approver_principals,public.website_change_requests,public.website_decision_intents TO authenticated;
CREATE POLICY website_membership_self ON public.website_approver_principals
 FOR SELECT TO authenticated USING ((supabase_user_id=auth.uid() AND active) OR public.mbm_is_sync_principal());
CREATE POLICY website_requests_private ON public.website_change_requests
 FOR SELECT TO authenticated USING (public.mbm_is_sync_principal() OR EXISTS(SELECT 1 FROM public.website_approver_principals p WHERE p.supabase_user_id=auth.uid() AND p.active));
CREATE POLICY website_intents_private ON public.website_decision_intents
 FOR SELECT TO authenticated USING (public.mbm_is_sync_principal() OR EXISTS(SELECT 1 FROM public.website_approver_principals p WHERE p.supabase_user_id=auth.uid() AND p.active));
-- View remains security-invoker so base-table policies are not bypassed.
CREATE VIEW public.website_approval_requests WITH (security_invoker=true) AS
 SELECT r.*,EXISTS(SELECT 1 FROM public.website_decision_intents d WHERE d.request_id=r.id AND d.acknowledged_at IS NULL) AS decision_pending
 FROM public.website_change_requests r;
GRANT SELECT ON public.website_approval_requests TO authenticated;

CREATE FUNCTION public.submit_change_request_decision(p_request_id text,p_approve boolean,p_note text,p_submission_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.website_approver_principals; r public.website_change_requests; d public.website_decision_intents;
BEGIN
 SELECT * INTO p FROM public.website_approver_principals WHERE supabase_user_id=auth.uid() AND active;
 IF NOT FOUND OR public.mbm_is_sync_principal() THEN RAISE EXCEPTION 'Private approver membership required'; END IF;
 IF p_approve IS NULL OR p_submission_id IS NULL OR length(p_note)>2000 THEN RAISE EXCEPTION 'Invalid decision'; END IF;
 SELECT * INTO d FROM public.website_decision_intents WHERE issuer_user_id=auth.uid() AND submission_id=p_submission_id;
 IF FOUND THEN
  IF d.request_id<>p_request_id OR d.approve<>p_approve OR d.note IS DISTINCT FROM p_note THEN RAISE EXCEPTION 'Submission key already used for another decision'; END IF;
  RETURN d.id;
 END IF;
 SELECT * INTO r FROM public.website_change_requests WHERE id=p_request_id FOR UPDATE;
 IF NOT FOUND OR r.status<>'PENDING' THEN RAISE EXCEPTION 'Request is not pending'; END IF;
 IF r.requested_by_id=p.principal_id THEN RAISE EXCEPTION 'Self approval is not allowed'; END IF;
 INSERT INTO public.website_decision_intents(submission_id,issuer_user_id,request_id,approve,note)
 VALUES(p_submission_id,auth.uid(),p_request_id,p_approve,p_note) RETURNING * INTO d;
 RETURN d.id;
END $$;
REVOKE ALL ON FUNCTION public.submit_change_request_decision(text,boolean,text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.submit_change_request_decision(text,boolean,text,uuid) TO authenticated;

-- Desktop-only RPCs. No website caller can claim, acknowledge or mirror.
CREATE FUNCTION public.website_claim_decision(p_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE d public.website_decision_intents; token uuid;
BEGIN
 IF NOT public.mbm_is_sync_principal() THEN RAISE EXCEPTION 'Restricted desktop sync required'; END IF;
 -- Only the oldest unfinished command can claim. Do not skip a locked head.
 SELECT * INTO d FROM public.website_decision_intents WHERE acknowledged_at IS NULL ORDER BY sequence LIMIT 1 FOR UPDATE;
 IF NOT FOUND OR d.id<>p_id OR (d.claim_until IS NOT NULL AND d.claim_until>now()) THEN RETURN NULL; END IF;
 token:=gen_random_uuid();
 UPDATE public.website_decision_intents SET claim_fence=token,claim_until=now()+interval '2 minutes' WHERE id=d.id;
 RETURN token;
END $$;
CREATE FUNCTION public.website_acknowledge_decision(p_id uuid,p_fence uuid,p_receipt jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE d public.website_decision_intents;
BEGIN
 IF NOT public.mbm_is_sync_principal() THEN RAISE EXCEPTION 'Restricted desktop sync required'; END IF;
 SELECT * INTO d FROM public.website_decision_intents WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR p_fence IS NULL OR d.claim_fence IS DISTINCT FROM p_fence THEN RAISE EXCEPTION 'Stale claim'; END IF;
 IF d.acknowledged_at IS NOT NULL THEN
  IF d.result=p_receipt THEN RETURN true; ELSE RAISE EXCEPTION 'Receipt changed'; END IF;
 END IF;
 IF d.claim_until IS NULL OR d.claim_until<=now() THEN RAISE EXCEPTION 'Expired claim'; END IF;
 IF jsonb_typeof(p_receipt) IS DISTINCT FROM 'object' OR p_receipt->>'intentId' IS DISTINCT FROM d.id::text OR p_receipt->>'requestId' IS DISTINCT FROM d.request_id THEN RAISE EXCEPTION 'Receipt identity mismatch'; END IF;
 IF p_receipt->>'status' IS NULL OR p_receipt->>'status' NOT IN ('APPLIED','REJECTED','CONFLICT','CANCELLED','REFUSED') THEN RAISE EXCEPTION 'Invalid receipt'; END IF;
 UPDATE public.website_decision_intents SET acknowledged_at=now(),result=p_receipt WHERE id=p_id;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.website_claim_decision(uuid),public.website_acknowledge_decision(uuid,uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.website_claim_decision(uuid),public.website_acknowledge_decision(uuid,uuid,jsonb) TO authenticated;

-- A desktop may mirror requests but cannot grant website membership, issue
-- an owner decision, or directly UPDATE/DELETE a queue command.
GRANT INSERT,UPDATE ON public.website_change_requests TO authenticated;
CREATE POLICY website_sync_mirror_insert ON public.website_change_requests FOR INSERT TO authenticated WITH CHECK (public.mbm_is_sync_principal());
CREATE POLICY website_sync_mirror_update ON public.website_change_requests FOR UPDATE TO authenticated USING (public.mbm_is_sync_principal()) WITH CHECK (public.mbm_is_sync_principal());
CREATE VIEW public.website_outgoing_sales WITH (security_barrier=true,security_invoker=false) AS SELECT id,sale_date,book_number,page_number,serial_number,party_name,vehicle_number,material_name,qty,final_amount,remaining_credit FROM public.outgoing_sales WHERE EXISTS(SELECT 1 FROM public.website_approver_principals p WHERE p.supabase_user_id=auth.uid() AND p.active) AND NOT public.mbm_is_sync_principal();
REVOKE ALL ON public.website_outgoing_sales FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.website_outgoing_sales TO authenticated;
CREATE VIEW public.website_incoming_boulder WITH (security_barrier=true,security_invoker=false) AS SELECT id,date,party_name,vehicle_number,material_name,qty,amount,settled FROM public.incoming_boulder WHERE EXISTS(SELECT 1 FROM public.website_approver_principals p WHERE p.supabase_user_id=auth.uid() AND p.active) AND NOT public.mbm_is_sync_principal();
REVOKE ALL ON public.website_incoming_boulder FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.website_incoming_boulder TO authenticated;
CREATE VIEW public.website_expenses WITH (security_barrier=true,security_invoker=false) AS SELECT id,amount,expense_date FROM public.expenses WHERE EXISTS(SELECT 1 FROM public.website_approver_principals p WHERE p.supabase_user_id=auth.uid() AND p.active) AND NOT public.mbm_is_sync_principal();
REVOKE ALL ON public.website_expenses FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.website_expenses TO authenticated;
CREATE VIEW public.website_day_books WITH (security_barrier=true,security_invoker=false) AS SELECT closing_cash_balance,business_date,updated_at FROM public.day_books WHERE EXISTS(SELECT 1 FROM public.website_approver_principals p WHERE p.supabase_user_id=auth.uid() AND p.active) AND NOT public.mbm_is_sync_principal();
REVOKE ALL ON public.website_day_books FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.website_day_books TO authenticated;
CREATE VIEW public.website_global_settings WITH (security_barrier=true,security_invoker=false) AS SELECT quarry_name FROM public.global_settings WHERE EXISTS(SELECT 1 FROM public.website_approver_principals p WHERE p.supabase_user_id=auth.uid() AND p.active) AND NOT public.mbm_is_sync_principal();
REVOKE ALL ON public.website_global_settings FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.website_global_settings TO authenticated;
COMMIT;
