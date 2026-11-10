'use server'
import { revalidatePath } from 'next/cache'
import { websiteMembership } from '@/lib/approvals/identity'

export async function submitDecision(requestId: string, approve: boolean, note: string, submissionId: string) {
  if (typeof requestId !== 'string' || !requestId.trim() || typeof approve !== 'boolean' ||
      typeof note !== 'string' || note.length > 2000 || typeof submissionId !== 'string' ||
      !/^[0-9a-f-]{36}$/i.test(submissionId)) {
    return { success: false, error: 'Check the decision and try again.' }
  }
  try {
    const { client, principal } = await websiteMembership()
    if (!principal) return { success: false, error: 'This login has no private approver access.' }
    // Proposed RPC derives issuer and principal from auth.uid() + the private
    // membership table, checks PENDING/self-approval, and deduplicates retries.
    // No user metadata/name or client principal id supplies authority.
    const { error } = await client.rpc('submit_change_request_decision', {
      p_request_id: requestId, p_approve: approve, p_note: note.trim() || null, p_submission_id: submissionId,
    })
    if (error) return { success: false, error: 'The decision was not recorded. Refresh the request and try again.' }
    revalidatePath('/approvals')
    return { success: true }
  } catch {
    return { success: false, error: 'The decision service is unavailable. Nothing is confirmed yet.' }
  }
}
