import type { Database } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type CreateIndependentDonationInput = {
  charityId: string
  amount: number
  donorName: string | null
  donorEmail: string | null
  message: string | null
  userId?: string | null
}

export async function createIndependentDonation(
  supabase: SupabaseServerClient,
  input: CreateIndependentDonationInput,
): Promise<void> {
  const payload: Database["public"]["Tables"]["independent_donations"]["Insert"] = {
    charity_id: input.charityId,
    amount: input.amount,
    donor_name: input.donorName,
    donor_email: input.donorEmail,
    message: input.message,
    user_id: input.userId ?? null,
  }

  const { error } = await supabase.from("independent_donations").insert(payload)

  if (error) {
    throw new Error(error.message)
  }
}
