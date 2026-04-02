import type { Database, Tables } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type CharityRow = Tables<"charities">
type CharityEventRow = Tables<"charity_events">

type CharityInput = {
  name: string
  description: string
  imageUrl: string | null
  featured: boolean
}

type PublicCharityFilters = {
  query?: string
  featuredOnly?: boolean
  limit?: number
  countryCode?: string
}

export async function getCharities(supabase: SupabaseServerClient): Promise<CharityRow[]> {
  const { data, error } = await supabase
    .from("charities")
    .select("*")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getPublicCharities(
  supabase: SupabaseServerClient,
  filters: PublicCharityFilters = {},
): Promise<CharityRow[]> {
  let query = supabase
    .from("charities")
    .select("*")
    .order("featured", { ascending: false })
    .order("name", { ascending: true })

  const searchValue = filters.query?.trim()

  if (searchValue) {
    query = query.or(`name.ilike.%${searchValue}%,description.ilike.%${searchValue}%`)
  }

  if (filters.featuredOnly) {
    query = query.eq("featured", true)
  }

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

export async function getCharityById(
  supabase: SupabaseServerClient,
  charityId: string,
): Promise<CharityRow | null> {
  const { data, error } = await supabase
    .from("charities")
    .select("*")
    .eq("id", charityId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getUpcomingCharityEvents(
  supabase: SupabaseServerClient,
  charityId: string,
  limit = 6,
): Promise<CharityEventRow[]> {
  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("charity_events")
    .select("*")
    .eq("charity_id", charityId)
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function createCharity(
  supabase: SupabaseServerClient,
  input: CharityInput,
): Promise<CharityRow> {
  const payload: Database["public"]["Tables"]["charities"]["Insert"] = {
    name: input.name,
    description: input.description,
    image_url: input.imageUrl,
    featured: input.featured,
  }

  const { data, error } = await supabase
    .from("charities")
    .insert(payload)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create charity")
  }

  return data
}

export async function updateCharity(
  supabase: SupabaseServerClient,
  charityId: string,
  input: CharityInput,
): Promise<CharityRow> {
  const payload: Database["public"]["Tables"]["charities"]["Update"] = {
    name: input.name,
    description: input.description,
    image_url: input.imageUrl,
    featured: input.featured,
  }

  const { data, error } = await supabase
    .from("charities")
    .update(payload)
    .eq("id", charityId)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update charity")
  }

  return data
}

export async function deleteCharity(supabase: SupabaseServerClient, charityId: string): Promise<void> {
  const { error } = await supabase.from("charities").delete().eq("id", charityId)

  if (error) {
    throw new Error(error.message)
  }
}
