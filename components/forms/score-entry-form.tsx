"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { createScoreAction } from "@/app/actions/score"
import { Button } from "@/components/ui/button"

const scoreSchema = z.object({
  score: z.coerce
    .number({ message: "Score is required" })
    .int("Score must be a whole number")
    .min(1, "Score must be at least 1")
    .max(45, "Score must be at most 45"),
  date: z.string().min(1, "Date is required"),
})

type ScoreFormInput = z.input<typeof scoreSchema>
type ScoreFormValues = z.output<typeof scoreSchema>

function getTodayDateString() {
  return new Date().toISOString().split("T")[0]
}

export function ScoreEntryForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const today = useMemo(() => getTodayDateString(), [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScoreFormInput, unknown, ScoreFormValues>({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      score: 18,
      date: today,
    },
  })

  const onSubmit = (values: ScoreFormValues) => {
    setServerError(null)
    setSuccessMessage(null)

    startTransition(async () => {
      const result = await createScoreAction(values)

      if (!result.success) {
        setServerError(result.error ?? "Unable to add score")
        return
      }

      if (result.trimmedOldestScore) {
        setSuccessMessage("Score saved. Your oldest score was removed to keep the latest 5 entries.")
      } else {
        setSuccessMessage("Score saved successfully.")
      }

      reset({
        score: 18,
        date: today,
      })
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="score" className="text-sm font-medium text-slate-800">
          Stableford score
        </label>
        <input
          id="score"
          type="number"
          min={1}
          max={45}
          step={1}
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
          {...register("score")}
        />
        {errors.score ? <p className="text-xs text-rose-600">{errors.score.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="date" className="text-sm font-medium text-slate-800">
          Score date
        </label>
        <input
          id="date"
          type="date"
          max={today}
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
          {...register("date")}
        />
        {errors.date ? <p className="text-xs text-rose-600">{errors.date.message}</p> : null}
      </div>

      <p className="text-xs text-slate-500">Only your latest 5 scores are retained automatically.</p>

      {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}
      {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving score..." : "Add score"}
      </Button>
    </form>
  )
}
