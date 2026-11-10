'use client'

import { useRef, useState } from 'react'
import { submitDecision } from './actions'

export function DecisionButtons({ requestId, waiting, unavailable }: { requestId: string; waiting: boolean; unavailable: boolean }) {
  const submission = useRef<string | null>(null)
  const [sent, setSent] = useState(waiting)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function decide(approve: boolean) {
    setBusy(true)
    setMessage('')
    submission.current ??= crypto.randomUUID()
    try {
      const res = await submitDecision(requestId, approve, note, submission.current)
      if (!res.success) setMessage(res.error || 'Could not record the decision.')
      else { setSent(true); setMessage('Decision recorded in the queue. Waiting for the app to check and apply it.') }
    } catch { setMessage('Connection lost. Refresh the request before retrying; its status is not confirmed.') }
    finally { setBusy(false) }
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <input
        disabled={busy || sent || waiting || unavailable}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
      />
      <div className="flex gap-2">
        <button
          disabled={busy || sent || waiting || unavailable}
          onClick={() => void decide(true)}
          className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Approve
        </button>
        <button
          disabled={busy || sent || waiting || unavailable}
          onClick={() => void decide(false)}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Reject
        </button>
      </div>
      {unavailable && <p className="text-xs text-amber-700">Sale details are missing. Review this request in the app.</p>}
      {sent && !message && <p className="text-xs text-slate-500">Decision queued. Waiting for the app.</p>}
      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  )
}
