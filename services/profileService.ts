import type { User } from "@supabase/supabase-js"

import type { Database, Tables } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type ProfileRow = Tables<"profiles">
type CharityOption = Pick<Tables<"charities">, "id" | "name" | "description" | "image_url" | "featured">

type ProfileUpdateInput = {
  name: string
  charityId: string | null
  charityPercentage: number
}

export async function getOrCreateProfile(
  supabase: SupabaseServerClient,
  user: User,
): Promise<ProfileRow> {
  const { data: existingProfile, error: existingError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existingProfile) {
    return existingProfile
  }

  const insertPayload: Database["public"]["Tables"]["profiles"]["Insert"] = {
    id: user.id,
    email: user.email ?? "",
    name: (user.user_metadata?.name as string | undefined) ?? "New User",
  }

  const { data: createdProfile, error: createError } = await supabase
    .from("profiles")
    .insert(insertPayload)
    .select("*")
    .single()

  if (createError || !createdProfile) {
    throw new Error(createError?.message ?? "Failed to create profile")
  }

  return createdProfile
}

export async function updateProfile(
  supabase: SupabaseServerClient,
  userId: string,
  input: ProfileUpdateInput,
): Promise<ProfileRow> {
  const payload: Database["public"]["Tables"]["profiles"]["Update"] = {
    name: input.name,
    charity_id: input.charityId,
    charity_percentage: input.charityPercentage,
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update profile")
  }

  return data
}

export async function getCharityOptions(supabase: SupabaseServerClient): Promise<CharityOption[]> {
  const { data, error } = await supabase
    .from("charities")
    .select("id, name, description, image_url, featured")
    .order("featured", { ascending: false })
    .order("name", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}
