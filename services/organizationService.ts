import type { Database, Tables } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type OrganizationRow = Tables<"organizations">
type OrganizationMemberRow = Tables<"organization_members">

type CreateOrganizationInput = {
  name: string
  accountType: Database["public"]["Enums"]["account_type"]
  countryCode: string
  createdBy: string | null
  billingEmail: string | null
  externalRef: string | null
}

export async function createOrganization(
  supabase: SupabaseServerClient,
  input: CreateOrganizationInput,
): Promise<OrganizationRow> {
  const payload: Database["public"]["Tables"]["organizations"]["Insert"] = {
    name: input.name,
    account_type: input.accountType,
    country_code: input.countryCode.toUpperCase(),
    created_by: input.createdBy,
    billing_email: input.billingEmail,
    external_ref: input.externalRef,
  }

  const { data, error } = await supabase
    .from("organizations")
    .insert(payload)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create organization")
  }

  return data
}

type AddOrganizationMemberInput = {
  organizationId: string
  userId: string
  role: Database["public"]["Enums"]["organization_member_role"]
}

export async function addOrganizationMember(
  supabase: SupabaseServerClient,
  input: AddOrganizationMemberInput,
): Promise<OrganizationMemberRow> {
  const payload: Database["public"]["Tables"]["organization_members"]["Insert"] = {
    organization_id: input.organizationId,
    user_id: input.userId,
    role: input.role,
    is_active: true,
  }

  const { data, error } = await supabase
    .from("organization_members")
    .upsert(payload, { onConflict: "organization_id,user_id" })
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to add organization member")
  }

  return data
}

export async function getOrganizationMembers(
  supabase: SupabaseServerClient,
  organizationId: string,
): Promise<OrganizationMemberRow[]> {
  const { data, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}
