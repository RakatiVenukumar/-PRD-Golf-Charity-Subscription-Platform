"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { updateWinnerStatusAction } from "@/app/actions/admin-winners"
import { Button } from "@/components/ui/button"

type Winner = {
  id: string
  user_id: string
  draw_id: string
  match_count: number
  prize_amount: number
  status: "pending" | "approved" | "paid" | "rejected"
  proof_url: string | null
  created_at: string
  user_name: string
  user_email: string
  draw_date: string
  draw_status: string
}

type AdminWinnerTableProps = {
  winners: Winner[]
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function statusClasses(status: Winner["status"]) {
  if (status === "paid") return "bg-emerald-100 text-emerald-700"
  if (status === "approved") return "bg-blue-100 text-blue-700"
  if (status === "rejected") return "bg-rose-100 text-rose-700"
  return "bg-amber-100 text-amber-700"
}

export function AdminWinnerTable({ winners }: AdminWinnerTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeWinnerId, setActiveWinnerId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleStatusUpdate = (winnerId: string, status: "approved" | "rejected" | "paid") => {
    setError(null)
    setActiveWinnerId(winnerId)

    startTransition(async () => {
      const result = await updateWinnerStatusAction({ winnerId, status })

      if (!result.success) {
        setError(result.error ?? "Failed to update winner status")
        setActiveWinnerId(null)
        return
      }

      setActiveWinnerId(null)
      router.refresh()
    })
  }

  if (winners.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
        No winners available yet. Execute a draw to generate winner records.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Winner</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Draw date</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Match tier</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Prize</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Proof</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {winners.map((winner) => {
              const rowBusy = isPending && activeWinnerId === winner.id

              return (
                <tr key={winner.id}>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-slate-900">{winner.user_name}</p>
                    <p className="text-xs text-slate-600">{winner.user_email}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    <p>{formatDate(winner.draw_date)}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{winner.draw_status}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{winner.match_count}-match</td>
                  <td className="px-3 py-3 font-semibold text-slate-900">${winner.prize_amount.toFixed(2)}</td>
                  <td className="px-3 py-3 text-slate-700">
                    {winner.proof_url ? (
                      <a href={winner.proof_url} target="_blank" rel="noreferrer" className="text-slate-900 underline">
                        View proof
                      </a>
                    ) : (
                      "Not uploaded"
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClasses(winner.status)}`}>
                      {winner.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {winner.status === "pending" ? (
                        <>
                          <Button size="sm" variant="outline" disabled={rowBusy} onClick={() => handleStatusUpdate(winner.id, "approved")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" disabled={rowBusy} onClick={() => handleStatusUpdate(winner.id, "rejected")}>
                            Reject
                          </Button>
                        </>
                      ) : null}

                      {winner.status === "approved" ? (
                        <Button size="sm" disabled={rowBusy} onClick={() => handleStatusUpdate(winner.id, "paid")}>
                          Mark paid
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
