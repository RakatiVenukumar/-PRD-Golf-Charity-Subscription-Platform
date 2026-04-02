"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createSupabaseServerClient } from "@/lib/supabase"
import { createScore, updateScore } from "@/services/scoreService"
import { requireActiveSubscription } from "@/services/subscriptionService"

const scoreSchema = z.object({
  score: z
    .number({ message: "Score is required" })
    .int("Score must be a whole number")
    .min(1, "Score must be at least 1")
    .max(45, "Score must be at most 45"),
  date: z.iso.date("Please enter a valid date"),
})

const updateScoreSchema = scoreSchema.extend({
  scoreId: z.uuid("Invalid score id"),
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

  const subscriptionState = await requireActiveSubscription(supabase, user.id)

  if (!subscriptionState.ok) {
    return {
      success: false,
      error: `Subscription required. Current status: ${subscriptionState.status}.`,
    }
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

export async function updateScoreAction(
  input: z.input<typeof updateScoreSchema>,
): Promise<ScoreActionResult> {
  const parsed = updateScoreSchema.safeParse(input)

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

  const subscriptionState = await requireActiveSubscription(supabase, user.id)

  if (!subscriptionState.ok) {
    return {
      success: false,
      error: `Subscription required. Current status: ${subscriptionState.status}.`,
    }
  }

  try {
    await updateScore(supabase, user.id, parsed.data.scoreId, {
      score: parsed.data.score,
      date: parsed.data.date,
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update score",
    }
  }
}
