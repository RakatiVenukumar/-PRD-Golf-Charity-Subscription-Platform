"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"

import {
  createDraftDrawAction,
  executeDrawAction,
  simulateDrawAction,
} from "@/app/actions/admin-draws"
import { Button } from "@/components/ui/button"

type Draw = {
  id: string
  draw_numbers: number[]
  draw_date: string
  status: "draft" | "published"
  jackpot_rollover: boolean
  created_at: string
}

type DrawSummary = {
  drawId: string
  tier5Winners: number
  tier4Winners: number
  tier3Winners: number
  totalPool: number
  jackpotRolledOver: boolean
}

type AdminDrawManagerProps = {
  draws: Draw[]
}

function formatDate(isoDate: string) {
  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) return isoDate

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function AdminDrawManager({ draws }: AdminDrawManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<"random" | "algorithmic">("random")
  const [drawDate, setDrawDate] = useState("")
  const [jackpotRollover, setJackpotRollover] = useState(false)
  const [activeDrawId, setActiveDrawId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [summaryByDraw, setSummaryByDraw] = useState<Record<string, DrawSummary>>({})

  const applySummary = (summary: DrawSummary | undefined) => {
    if (!summary) {
      return
    }

    setSummaryByDraw((prev) => ({ ...prev, [summary.drawId]: summary }))
  }

  const latestDraft = useMemo(
    () => draws.find((draw) => draw.status === "draft") ?? null,
    [draws],
  )

  const handleCreateDraft = () => {
    setError(null)
    setMessage(null)

    startTransition(async () => {
      const result = await createDraftDrawAction({
        mode,
        drawDate,
        jackpotRollover,
      })

      if (!result.success) {
        setError(result.error ?? "Unable to create draft draw")
        return
      }

      setMessage(result.message ?? "Draft created")
      applySummary(result.summary)
      router.refresh()
    })
  }

  const handleSimulate = (drawId: string) => {
    setError(null)
    setMessage(null)
    setActiveDrawId(drawId)

    startTransition(async () => {
      const result = await simulateDrawAction({ drawId })

      if (!result.success) {
        setError(result.error ?? "Unable to simulate draw")
        setActiveDrawId(null)
        return
      }

      setMessage(result.message ?? "Simulation complete")
      applySummary(result.summary)
      setActiveDrawId(null)
    })
  }

  const handleExecute = (drawId: string) => {
    setError(null)
    setMessage(null)
    setActiveDrawId(drawId)

    startTransition(async () => {
      const result = await executeDrawAction({ drawId })

      if (!result.success) {
        setError(result.error ?? "Unable to execute draw")
        setActiveDrawId(null)
        return
      }

      setMessage(result.message ?? "Draw executed")
      applySummary(result.summary)
      setActiveDrawId(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Create Monthly Draft</h3>
        <p className="mt-1 text-xs text-slate-600">Choose draw mode and prepare a draft before execution.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as "random" | "algorithmic")}
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
          >
            <option value="random">Random mode</option>
            <option value="algorithmic">Algorithmic mode</option>
          </select>

          <input
            type="date"
            value={drawDate}
            onChange={(event) => setDrawDate(event.target.value)}
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
          />

          <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={jackpotRollover}
              onChange={(event) => setJackpotRollover(event.target.checked)}
            />
            Force jackpot rollover flag
          </label>
        </div>

        <div className="mt-4">
          <Button type="button" onClick={handleCreateDraft} disabled={isPending}>
            {isPending ? "Creating..." : "Create draft draw"}
          </Button>
        </div>
      </section>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {latestDraft ? (
        <p className="text-xs text-slate-600">
          Latest draft draw: <span className="font-semibold text-slate-800">{formatDate(latestDraft.draw_date)}</span>
        </p>
      ) : null}

      <div className="space-y-3">
        {draws.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            No draws created yet.
          </div>
        ) : (
          draws.map((draw) => {
            const summary = summaryByDraw[draw.id]
            const isBusyRow = isPending && activeDrawId === draw.id

            return (
              <article key={draw.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{formatDate(draw.draw_date)}</p>
                    <p className="text-xs text-slate-600">Numbers: {draw.draw_numbers.join(", ")}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                      {draw.status} {draw.jackpot_rollover ? "| jackpot rollover" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={isBusyRow} onClick={() => handleSimulate(draw.id)}>
                      {isBusyRow ? "Running..." : "Simulate"}
                    </Button>
                    <Button size="sm" disabled={isBusyRow || draw.status === "published"} onClick={() => handleExecute(draw.id)}>
                      {draw.status === "published" ? "Published" : "Execute & publish"}
                    </Button>
                  </div>
                </div>

                {summary ? (
                  <div className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 sm:grid-cols-5">
                    <p>Pool: ${summary.totalPool.toFixed(2)}</p>
                    <p>5-match: {summary.tier5Winners}</p>
                    <p>4-match: {summary.tier4Winners}</p>
                    <p>3-match: {summary.tier3Winners}</p>
                    <p>{summary.jackpotRolledOver ? "Jackpot rollover" : "Jackpot claimed"}</p>
                  </div>
                ) : null}
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
