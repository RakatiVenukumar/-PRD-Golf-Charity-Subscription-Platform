"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { isAdminEmail } from "@/lib/admin"
import { createSupabaseServerClient } from "@/lib/supabase"
import { sendWinnerStatusNotification } from "@/services/notificationService"
import { updateWinnerStatus } from "@/services/winnerService"

const updateWinnerStatusSchema = z.object({
  winnerId: z.uuid("Invalid winner id"),
  status: z.enum(["approved", "rejected", "paid"]),
})

type ActionResult = {
  success: boolean
  error?: string
}

export async function updateWinnerStatusAction(
  input: z.input<typeof updateWinnerStatusSchema>,
): Promise<ActionResult> {
  const parsed = updateWinnerStatusSchema.safeParse(input)

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
    const updated = await updateWinnerStatus(supabase, parsed.data.winnerId, parsed.data.status)

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("id", updated.user_id)
      .maybeSingle()

    if (profile?.email) {
      await sendWinnerStatusNotification(
        profile.email,
        profile.name,
        parsed.data.status,
        updated.prize_amount,
      ).catch(() => undefined)
    }
  } catch (serviceError) {
    return {
      success: false,
      error: serviceError instanceof Error ? serviceError.message : "Failed to update winner status",
    }
  }

  revalidatePath("/admin")
  revalidatePath("/dashboard")
  return { success: true }
}
