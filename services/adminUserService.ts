import type { Database, Tables } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type AdminUserRow = Pick<
  Tables<"profiles">,
  "id" | "name" | "email" | "subscription_status" | "renewal_date" | "created_at"
>

type AdminUserUpdateInput = {
  name: string
  subscriptionStatus: Database["public"]["Enums"]["subscription_status"]
  renewalDate: string | null
}

export async function getAdminUsers(supabase: SupabaseServerClient): Promise<AdminUserRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, subscription_status, renewal_date, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function updateAdminUser(
  supabase: SupabaseServerClient,
  userId: string,
  input: AdminUserUpdateInput,
): Promise<AdminUserRow> {
  const payload: Database["public"]["Tables"]["profiles"]["Update"] = {
    name: input.name,
    subscription_status: input.subscriptionStatus,
    renewal_date: input.renewalDate,
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("id, name, email, subscription_status, renewal_date, created_at")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to update user")
  }

  return data
}
