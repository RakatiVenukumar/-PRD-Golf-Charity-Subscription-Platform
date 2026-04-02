"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createSupabaseServerClient } from "@/lib/supabase"
import { createIndependentDonation } from "@/services/donationService"

const createIndependentDonationSchema = z.object({
  charityId: z.uuid("Please select a valid charity"),
  amount: z.number().positive("Donation amount must be greater than 0"),
  donorName: z.string().trim().max(120, "Donor name is too long").optional().nullable(),
  donorEmail: z.string().trim().toLowerCase().email("Invalid email").optional().nullable(),
  message: z.string().trim().max(500, "Message is too long").optional().nullable(),
})

type DonationActionResult = {
  success: boolean
  error?: string
}

export async function createIndependentDonationAction(
  input: z.input<typeof createIndependentDonationSchema>,
): Promise<DonationActionResult> {
  const parsed = createIndependentDonationSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid donation input" }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  try {
    await createIndependentDonation(supabase, {
      charityId: parsed.data.charityId,
      amount: parsed.data.amount,
      donorName: parsed.data.donorName ?? null,
      donorEmail: parsed.data.donorEmail ?? null,
      message: parsed.data.message ?? null,
      userId: user?.id ?? null,
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit donation",
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/charities")
  return { success: true }
}
