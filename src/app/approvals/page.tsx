// W1: private approvals - owner-provisioned private membership is required.
// Decision intents go through an authenticated provider RPC; the ERP applies them with its own guards and
// writes the outcome back, so this page shows ERP-decided status as truth.
import { websiteMembership } from '@/lib/approvals/identity'
import { redirect } from 'next/navigation'
import { requestTitle, requestDiff } from '@/lib/approvals/format'
import { DecisionButtons } from './decision-buttons'

export default async function ApprovalsPage() {
  const { client: supabase, principal } = await websiteMembership()
  if (!principal) redirect('/access-denied')

  const selection='id, entity_name, entity_id, operation, original_value, proposed_value, reason, status, requested_by_name, created_at, decided_by_name, decision_note, decision_pending, sale_context';
  // Pending queue is queried independently so recent decided requests cannot
  // hide an older still-pending request within the history limit.
  const pendingResult = await supabase.from('website_approval_requests').select(selection)
    .eq('status','PENDING').order('created_at',{ascending:true}).limit(100);
  const historyResult = await supabase.from('website_approval_requests').select(selection)
    .neq('status','PENDING').order('created_at',{ascending:false}).limit(10);
  const pending=pendingResult.data??[];
  const decided=historyResult.data??[];
  const error=pendingResult.error||historyResult.error;

  return (
    <div className="space-y-5 p-4 lg:p-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Approvals</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Saved requests from the app. This is not a live feed. Approving or rejecting records a decision in the queue; the app must connect, check it and return the result. Refresh to check for updates.
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Could not load change requests right now.
        </p>
      )}

      {pending.length === 100 && <p className="text-sm text-amber-700">Showing the oldest 100 pending requests. More may be waiting; work through these and refresh.</p>}
      {pending.length === 0 && !error && (
        <p className="rounded-md border border-slate-200 dark:border-slate-800 p-4 text-sm text-slate-500">
          Nothing waiting for approval.
        </p>
      )}

      <div className="grid gap-3">
        {pending.map((r) => (
          <div key={r.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex flex-col gap-1">
              <p className="break-words text-sm font-medium">
                {requestTitle(r.operation)}
              </p>
              <p className="text-xs text-slate-500">
                {r.sale_context ? `${r.sale_context.date} - Book ${r.sale_context.book}, page ${r.sale_context.page} - ${r.sale_context.customer} - ${r.sale_context.vehicle}` : 'Sale details unavailable. Check the request in the app before deciding.'}
              </p>
              <p className="break-words text-sm text-slate-600 dark:text-slate-300">
                {requestDiff(r.operation,r.original_value,r.proposed_value)}
              </p>
              <p className="text-xs text-slate-500">
                Asked by {r.requested_by_name} · Reason: {r.reason}
              </p>
            </div>
            <DecisionButtons requestId={r.id} waiting={!!r.decision_pending} unavailable={!r.sale_context} />
          </div>
        ))}
      </div>

      {decided.length > 0 && (
        <div className="pt-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-500">Recently decided</h2>
          <div className="grid gap-2">
            {decided.slice(0, 10).map((r) => (
              <div key={r.id} className="break-words rounded-md border border-slate-100 dark:border-slate-800 p-3 text-xs text-slate-500">
                {r.sale_context ? `${r.sale_context.date} - Book ${r.sale_context.book}, page ${r.sale_context.page} - ${r.sale_context.customer}` : requestTitle(r.operation)} - {r.status}
                {r.decided_by_name && ` - Decided by ${r.decided_by_name}`}
                {r.decision_note && ` - ${r.decision_note}`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
