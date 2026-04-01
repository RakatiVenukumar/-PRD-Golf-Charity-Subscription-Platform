import type { Database, Tables } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type CharityRow = Tables<"charities">

type CharityInput = {
  name: string
  description: string
  imageUrl: string | null
  featured: boolean
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
