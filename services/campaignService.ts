import type { Database, Tables } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type CampaignRow = Tables<"campaigns">

type PublicCampaignFilters = {
  countryCode?: string
  statuses?: Database["public"]["Enums"]["campaign_status"][]
  limit?: number
}

export async function getPublicCampaigns(
  supabase: SupabaseServerClient,
  filters: PublicCampaignFilters = {},
): Promise<CampaignRow[]> {
  const allowedStatuses = filters.statuses && filters.statuses.length > 0
    ? filters.statuses
    : ["scheduled", "active", "completed"]

  let query = supabase
    .from("campaigns")
    .select("*")
    .in("status", allowedStatuses)
    .order("starts_at", { ascending: true, nullsFirst: false })

  const countryCode = filters.countryCode?.trim().toUpperCase()

  if (countryCode) {
    query = query.eq("country_code", countryCode)
  }

  if (filters.limit && filters.limit > 0) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}
