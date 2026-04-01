"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { isAdminEmail } from "@/lib/admin"
import { createSupabaseServerClient } from "@/lib/supabase"
import { updateAdminUser } from "@/services/adminUserService"

const adminUserUpdateSchema = z.object({
  userId: z.uuid("Invalid user id"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  subscriptionStatus: z.enum(["active", "inactive", "lapsed", "canceled"]),
  renewalDate: z.union([z.iso.date(), z.literal(""), z.null()]).transform((value) => (value ? value : null)),
})

type AdminActionResult = {
  success: boolean
  error?: string
}

export async function updateAdminUserAction(
  input: z.input<typeof adminUserUpdateSchema>,
): Promise<AdminActionResult> {
  const parsed = adminUserUpdateSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user || !isAdminEmail(user.email)) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await updateAdminUser(supabase, parsed.data.userId, {
      name: parsed.data.name,
      subscriptionStatus: parsed.data.subscriptionStatus,
      renewalDate: parsed.data.renewalDate,
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    }
  }

  revalidatePath("/admin")
  return { success: true }
}
