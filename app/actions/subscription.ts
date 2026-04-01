"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createSupabaseServerClient } from "@/lib/supabase"
import { createMockSubscription } from "@/services/subscriptionService"

const subscribeSchema = z.object({
  planType: z.enum(["monthly", "yearly"]),
})

type SubscriptionActionResult = {
  success: boolean
  message?: string
  error?: string
}

export async function subscribeAction(
  input: z.input<typeof subscribeSchema>,
): Promise<SubscriptionActionResult> {
  const parsed = subscribeSchema.safeParse(input)

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
    const result = await createMockSubscription(supabase, user.id, parsed.data.planType)

    revalidatePath("/dashboard")
    return {
      success: true,
      message: `Mock payment successful. ${parsed.data.planType} plan activated. Next renewal: ${result.renewalDate}.`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to activate subscription",
    }
  }
}
