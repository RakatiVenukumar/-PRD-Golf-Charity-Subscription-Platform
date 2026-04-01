import type { Database, Enums, Tables } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type PlanType = Enums<"plan_type">

type SubscriptionSnapshot = {
  profileStatus: Enums<"subscription_status">
  renewalDate: string | null
  currentPlan: PlanType | null
  latestPayment: Pick<Tables<"payments">, "amount" | "status" | "created_at"> | null
}

const PLAN_PRICES: Record<PlanType, number> = {
  monthly: 29,
  yearly: 299,
}

function addMonths(date: Date, months: number) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

function toIsoDate(date: Date) {
  return date.toISOString().split("T")[0]
}

function calculateRenewalDate(planType: PlanType): string {
  const now = new Date()
  const renewal = planType === "monthly" ? addMonths(now, 1) : addMonths(now, 12)
  return toIsoDate(renewal)
}

export async function createMockSubscription(
  supabase: SupabaseServerClient,
  userId: string,
  planType: PlanType,
) {
  const renewalDate = calculateRenewalDate(planType)

  const profileUpdate: Database["public"]["Tables"]["profiles"]["Update"] = {
    subscription_status: "active",
    renewal_date: renewalDate,
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", userId)

  if (profileError) {
    throw new Error(profileError.message)
  }

  const subscriptionPayload: Database["public"]["Tables"]["subscriptions"]["Insert"] = {
    user_id: userId,
    plan_type: planType,
    status: "active",
    renewal_date: renewalDate,
  }

  const { error: subscriptionError } = await supabase.from("subscriptions").insert(subscriptionPayload)

  if (subscriptionError) {
    throw new Error(subscriptionError.message)
  }

  const paymentPayload: Database["public"]["Tables"]["payments"]["Insert"] = {
    user_id: userId,
    amount: PLAN_PRICES[planType],
    status: "paid",
  }

  const { error: paymentError } = await supabase.from("payments").insert(paymentPayload)

  if (paymentError) {
    throw new Error(paymentError.message)
  }

  return {
    renewalDate,
    amount: PLAN_PRICES[planType],
  }
}

export async function getSubscriptionSnapshot(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<SubscriptionSnapshot> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("subscription_status, renewal_date")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    throw new Error(profileError?.message ?? "Unable to load profile subscription status")
  }

  const { data: latestSubscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("plan_type")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subscriptionError) {
    throw new Error(subscriptionError.message)
  }

  const { data: latestPayment, error: paymentError } = await supabase
    .from("payments")
    .select("amount, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (paymentError) {
    throw new Error(paymentError.message)
  }

  return {
    profileStatus: profile.subscription_status,
    renewalDate: profile.renewal_date,
    currentPlan: latestSubscription?.plan_type ?? null,
    latestPayment: latestPayment ?? null,
  }
}
