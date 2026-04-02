"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { isAdminEmail } from "@/lib/admin"
import { createSupabaseServerClient } from "@/lib/supabase"
import { updateScoreByAdmin } from "@/services/adminScoreService"

const updateAdminScoreSchema = z.object({
  scoreId: z.uuid("Invalid score id"),
  score: z
    .number({ message: "Score is required" })
    .int("Score must be a whole number")
    .min(1, "Score must be at least 1")
    .max(45, "Score must be at most 45"),
  date: z.iso.date("Please enter a valid date"),
})

type ActionResult = {
  success: boolean
  error?: string
}

export async function updateAdminScoreAction(
  input: z.input<typeof updateAdminScoreSchema>,
): Promise<ActionResult> {
  const parsed = updateAdminScoreSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user || !isAdminEmail(user.email)) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await updateScoreByAdmin(supabase, parsed.data.scoreId, {
      score: parsed.data.score,
      date: parsed.data.date,
    })
  } catch (serviceError) {
    return {
      success: false,
      error: serviceError instanceof Error ? serviceError.message : "Failed to update score",
    }
  }

  revalidatePath("/admin")
  revalidatePath("/dashboard")
  return { success: true }
}
