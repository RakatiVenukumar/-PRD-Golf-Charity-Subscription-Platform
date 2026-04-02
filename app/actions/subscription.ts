"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createSupabaseServerClient } from "@/lib/supabase"
import {
  cancelActiveSubscription,
  createCheckoutSession,
  requireActiveSubscription,
} from "@/services/subscriptionService"

const subscribeSchema = z.object({
  planType: z.enum(["monthly", "yearly"]),
})

type SubscriptionActionResult = {
  success: boolean
  message?: string
  error?: string
  checkoutUrl?: string
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
    const checkout = await createCheckoutSession(
      supabase,
      user.id,
      user.email ?? "",
      parsed.data.planType,
    )

    revalidatePath("/dashboard")

    if (checkout.checkoutUrl) {
      return {
        success: true,
        message: "Redirecting to secure checkout...",
        checkoutUrl: checkout.checkoutUrl,
      }
    }

    return {
      success: true,
      message: `${parsed.data.planType} plan activated. Next renewal: ${checkout.renewalDate}.`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to activate subscription",
    }
  }
}

export async function cancelSubscriptionAction(): Promise<SubscriptionActionResult> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await cancelActiveSubscription(supabase, user.id)
  } catch (serviceError) {
    return {
      success: false,
      error: serviceError instanceof Error ? serviceError.message : "Unable to cancel subscription",
    }
  }

  revalidatePath("/dashboard")
  return { success: true, message: "Subscription canceled. Access to subscriber-only features is now restricted." }
}

export async function ensureActiveSubscriptionAction(): Promise<SubscriptionActionResult> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { success: false, error: "Unauthorized" }
  }

  const state = await requireActiveSubscription(supabase, user.id)

  if (!state.ok) {
    return {
      success: false,
      error: `Subscription required. Current status: ${state.status}.`,
    }
  }

  return { success: true }
}
