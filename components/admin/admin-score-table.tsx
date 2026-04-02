"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { updateAdminScoreAction } from "@/app/actions/admin-scores"
import { Button } from "@/components/ui/button"

type AdminScore = {
  id: string
  user_id: string
  score: number
  date: string
  created_at: string
  user_name: string
  user_email: string
}

type AdminScoreTableProps = {
  scores: AdminScore[]
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

export function AdminScoreTable({ scores }: AdminScoreTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [drafts, setDrafts] = useState<Record<string, { score: string; date: string }>>(() =>
    Object.fromEntries(
      scores.map((entry) => [
        entry.id,
        {
          score: String(entry.score),
          date: entry.date,
        },
      ]),
    ),
  )

  const handleDraftChange = (scoreId: string, key: "score" | "date", value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [scoreId]: {
        ...prev[scoreId],
        [key]: value,
      },
    }))
  }

  const handleSave = (scoreId: string) => {
    const draft = drafts[scoreId]
    if (!draft) return

    setError(null)
    setEditingScoreId(scoreId)

    startTransition(async () => {
      const parsedScore = Number(draft.score)

      const result = await updateAdminScoreAction({
        scoreId,
        score: parsedScore,
        date: draft.date,
      })

      if (!result.success) {
        setError(result.error ?? "Failed to update score")
        setEditingScoreId(null)
        return
      }

      setEditingScoreId(null)
      router.refresh()
    })
  }

  if (scores.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
        No scores found yet.
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
              <th className="px-3 py-3 text-left font-semibold text-slate-700">User</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Email</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Score</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Date</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Created</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {scores.map((entry) => {
              const draft = drafts[entry.id]
              const isRowSaving = isPending && editingScoreId === entry.id

              return (
                <tr key={entry.id}>
                  <td className="px-3 py-3 text-slate-900 font-medium">{entry.user_name}</td>
                  <td className="px-3 py-3 text-slate-700">{entry.user_email}</td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min={1}
                      max={45}
                      step={1}
                      value={draft?.score ?? ""}
                      onChange={(event) => handleDraftChange(entry.id, "score", event.target.value)}
                      className="h-9 w-24 rounded-md border border-slate-300 px-2"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="date"
                      value={draft?.date ?? ""}
                      onChange={(event) => handleDraftChange(entry.id, "date", event.target.value)}
                      className="h-9 rounded-md border border-slate-300 px-2"
                    />
                  </td>
                  <td className="px-3 py-3 text-slate-700">{formatDate(entry.created_at)}</td>
                  <td className="px-3 py-3 text-right">
                    <Button size="sm" onClick={() => handleSave(entry.id)} disabled={isRowSaving}>
                      {isRowSaving ? "Saving..." : "Save"}
                    </Button>
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
