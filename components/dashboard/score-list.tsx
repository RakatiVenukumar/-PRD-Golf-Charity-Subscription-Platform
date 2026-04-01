import type { Tables } from "@/types/database"

type ScoreListProps = {
  scores: Tables<"scores">[]
}

function formatDate(isoDate: string) {
  const value = new Date(isoDate)

  if (Number.isNaN(value.getTime())) {
    return isoDate
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value)
}

export function ScoreList({ scores }: ScoreListProps) {
  if (scores.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        No scores yet. Add your first Stableford score to start your monthly draw journey.
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {scores.map((entry, index) => (
        <li
          key={entry.id}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
        >
          <div>
            <p className="text-sm font-medium text-slate-800">{formatDate(entry.date)}</p>
            <p className="text-xs text-slate-500">Entry #{scores.length - index}</p>
          </div>
          <p className="text-lg font-semibold text-slate-900">{entry.score}</p>
        </li>
      ))}
    </ul>
  )
}
