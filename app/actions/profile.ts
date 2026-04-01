"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createSupabaseServerClient } from "@/lib/supabase"
import { updateProfile } from "@/services/profileService"

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  charityId: z.union([z.uuid(), z.literal(""), z.null()]).transform((value) => (value ? value : null)),
  charityPercentage: z
    .number({ message: "Charity percentage is required" })
    .min(10, "Charity percentage must be at least 10%")
    .max(100, "Charity percentage cannot exceed 100%"),
})

type ProfileActionResult = {
  success: boolean
  error?: string
}

export async function updateProfileAction(
  input: z.input<typeof updateProfileSchema>,
): Promise<ProfileActionResult> {
  const parsed = updateProfileSchema.safeParse(input)

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
    await updateProfile(supabase, user.id, {
      name: parsed.data.name,
      charityId: parsed.data.charityId,
      charityPercentage: parsed.data.charityPercentage,
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    }
  }

  revalidatePath("/dashboard")
  return { success: true }
}
