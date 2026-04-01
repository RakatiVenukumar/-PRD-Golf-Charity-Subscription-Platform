"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { isAdminEmail } from "@/lib/admin"
import { createSupabaseServerClient } from "@/lib/supabase"
import { createCharity, deleteCharity, updateCharity } from "@/services/charityService"

const charityPayloadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  imageUrl: z.union([z.url("Invalid image URL"), z.literal(""), z.null()]).transform((value) => (value ? value : null)),
  featured: z.boolean(),
})

const createCharitySchema = charityPayloadSchema
const updateCharitySchema = charityPayloadSchema.extend({
  charityId: z.uuid("Invalid charity id"),
})
const deleteCharitySchema = z.object({
  charityId: z.uuid("Invalid charity id"),
})

type ActionResult = {
  success: boolean
  error?: string
}

async function getAuthorizedClient() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user || !isAdminEmail(user.email)) {
    throw new Error("Unauthorized")
  }

  return supabase
}

export async function createCharityAction(
  input: z.input<typeof createCharitySchema>,
): Promise<ActionResult> {
  const parsed = createCharitySchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  try {
    const supabase = await getAuthorizedClient()
    await createCharity(supabase, parsed.data)
    revalidatePath("/admin")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create charity" }
  }
}

export async function updateCharityAction(
  input: z.input<typeof updateCharitySchema>,
): Promise<ActionResult> {
  const parsed = updateCharitySchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  try {
    const supabase = await getAuthorizedClient()
    await updateCharity(supabase, parsed.data.charityId, parsed.data)
    revalidatePath("/admin")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update charity" }
  }
}

export async function deleteCharityAction(
  input: z.input<typeof deleteCharitySchema>,
): Promise<ActionResult> {
  const parsed = deleteCharitySchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  try {
    const supabase = await getAuthorizedClient()
    await deleteCharity(supabase, parsed.data.charityId)
    revalidatePath("/admin")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete charity" }
  }
}
