"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createSupabaseServerClient } from "@/lib/supabase"
import { requireActiveSubscription } from "@/services/subscriptionService"
import { updateWinnerProofUrl } from "@/services/winnerService"

const proofSchema = z.object({
  winnerId: z.uuid("Invalid winner id"),
  proofUrl: z.url("Invalid proof URL"),
})

type ProofActionResult = {
  success: boolean
  error?: string
}

export async function saveWinnerProofAction(
  input: z.input<typeof proofSchema>,
): Promise<ProofActionResult> {
  const parsed = proofSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
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
    await updateWinnerProofUrl(supabase, user.id, parsed.data.winnerId, parsed.data.proofUrl)
  } catch (serviceError) {
    return {
      success: false,
      error: serviceError instanceof Error ? serviceError.message : "Failed to save proof",
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/admin")
  return { success: true }
}
