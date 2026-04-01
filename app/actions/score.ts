"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createSupabaseServerClient } from "@/lib/supabase"
import { createScore } from "@/services/scoreService"

const scoreSchema = z.object({
  score: z
    .number({ message: "Score is required" })
    .int("Score must be a whole number")
    .min(1, "Score must be at least 1")
    .max(45, "Score must be at most 45"),
  date: z.iso.date("Please enter a valid date"),
})

type ScoreActionResult = {
  success: boolean
  trimmedOldestScore?: boolean
  error?: string
}

export async function createScoreAction(
  input: z.input<typeof scoreSchema>,
): Promise<ScoreActionResult> {
  const parsed = scoreSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const result = await createScore(supabase, user.id, {
      score: parsed.data.score,
      date: parsed.data.date,
    })

    revalidatePath("/dashboard")
    return { success: true, trimmedOldestScore: result.trimmedCount > 0 }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create score",
    }
  }
}
