"use client"

import { useState } from "react"

import { ScoreList } from "@/components/dashboard/score-list"
import { ScoreEntryForm } from "@/components/forms/score-entry-form"
import type { Tables } from "@/types/database"

type ScoreManagerProps = {
  scores: Tables<"scores">[]
  disabled?: boolean
}

export function ScoreManager({ scores, disabled = false }: ScoreManagerProps) {
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null)

  const editingScore = scores.find((score) => score.id === editingScoreId) ?? null

  return (
    <div className="space-y-6">
      <ScoreEntryForm
        disabled={disabled}
        editingScore={editingScore}
        onCancelEdit={() => setEditingScoreId(null)}
      />
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Latest 5 scores</h3>
        <ScoreList
          scores={scores}
          editingScoreId={editingScoreId}
          onEdit={(scoreId) => setEditingScoreId(scoreId)}
        />
      </div>
    </div>
  )
}
