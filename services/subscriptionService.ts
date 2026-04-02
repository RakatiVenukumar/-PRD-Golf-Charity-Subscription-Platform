import type { Database, Enums, Tables } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type PlanType = Enums<"plan_type">

type SubscriptionSnapshot = {
  profileStatus: Enums<"subscription_status">
  renewalDate: string | null
  currentPlan: PlanType | null
  latestPayment: Pick<Tables<"payments">, "amount" | "status" | "created_at"> | null
}

type CheckoutSessionResult = {
  provider: "stripe" | "mock"
  checkoutUrl: string | null
  renewalDate?: string
  amount?: number
}

const PLAN_PRICES: Record<PlanType, number> = {
  monthly: 29,
  yearly: 299,
}

function getTodayIsoDate() {
  return new Date().toISOString().split("T")[0]
}

function resolveAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return "http://localhost:3000"
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

export async function createCheckoutSession(
  supabase: SupabaseServerClient,
  userId: string,
  userEmail: string,
  planType: PlanType,
): Promise<CheckoutSessionResult> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!stripeSecretKey) {
    const result = await createMockSubscription(supabase, userId, planType)
    return {
      provider: "mock",
      checkoutUrl: null,
      renewalDate: result.renewalDate,
      amount: result.amount,
    }
  }

  const Stripe = (await import("stripe")).default
  const stripe = new Stripe(stripeSecretKey)
  const appUrl = resolveAppUrl()

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: userEmail,
    success_url: `${appUrl}/dashboard?payment=success&plan=${planType}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/dashboard?payment=canceled`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: {
            name: `Golf Charity Platform - ${planType === "monthly" ? "Monthly" : "Yearly"} Plan`,
          },
          unit_amount: PLAN_PRICES[planType] * 100,
        },
      },
    ],
    metadata: {
      user_id: userId,
      plan_type: planType,
    },
  })

  if (!session.url) {
    throw new Error("Unable to create Stripe checkout session")
  }

  return {
    provider: "stripe",
    checkoutUrl: session.url,
  }
}

export async function finalizeStripeCheckout(
  supabase: SupabaseServerClient,
  userId: string,
  planType: PlanType,
  sessionId: string,
): Promise<{ activated: boolean; renewalDate?: string }> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!stripeSecretKey) {
    return { activated: false }
  }

  const Stripe = (await import("stripe")).default
  const stripe = new Stripe(stripeSecretKey)
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  const metaUserId = session.metadata?.user_id
  const metaPlan = session.metadata?.plan_type

  if (metaUserId !== userId || metaPlan !== planType) {
    throw new Error("Invalid checkout session context")
  }

  if (session.payment_status !== "paid") {
    return { activated: false }
  }

  const activation = await activateSubscription(supabase, userId, planType, "paid")
  return { activated: true, renewalDate: activation.renewalDate }
}

export async function activateSubscription(
  supabase: SupabaseServerClient,
  userId: string,
  planType: PlanType,
  paymentStatus: Database["public"]["Enums"]["payment_status"] = "paid",
) {
  const renewalDate = calculateRenewalDate(planType)

  const profileUpdate: Database["public"]["Tables"]["profiles"]["Update"] = {
    subscription_status: paymentStatus === "paid" ? "active" : "inactive",
    renewal_date: paymentStatus === "paid" ? renewalDate : null,
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
    status: paymentStatus === "paid" ? "active" : "inactive",
    renewal_date: renewalDate,
  }

  const { error: subscriptionError } = await supabase.from("subscriptions").insert(subscriptionPayload)

  if (subscriptionError) {
    throw new Error(subscriptionError.message)
  }

  const paymentPayload: Database["public"]["Tables"]["payments"]["Insert"] = {
    user_id: userId,
    amount: PLAN_PRICES[planType],
    status: paymentStatus,
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

export async function markSubscriptionLapsedIfExpired(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<Enums<"subscription_status">> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("subscription_status, renewal_date")
    .eq("id", userId)
    .single()

  if (error || !profile) {
    throw new Error(error?.message ?? "Unable to validate subscription")
  }

  if (profile.subscription_status !== "active" || !profile.renewal_date) {
    return profile.subscription_status
  }

  const today = getTodayIsoDate()

  if (profile.renewal_date >= today) {
    return profile.subscription_status
  }

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({ subscription_status: "lapsed" })
    .eq("id", userId)

  if (profileUpdateError) {
    throw new Error(profileUpdateError.message)
  }

  const { error: subUpdateError } = await supabase
    .from("subscriptions")
    .update({ status: "lapsed" })
    .eq("user_id", userId)
    .eq("status", "active")

  if (subUpdateError) {
    throw new Error(subUpdateError.message)
  }

  return "lapsed"
}

export async function cancelActiveSubscription(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<void> {
  const { error: subscriptionsError } = await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("user_id", userId)
    .eq("status", "active")

  if (subscriptionsError) {
    throw new Error(subscriptionsError.message)
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      subscription_status: "canceled",
      renewal_date: null,
    })
    .eq("id", userId)

  if (profileError) {
    throw new Error(profileError.message)
  }
}

export async function requireActiveSubscription(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<{ ok: boolean; status: Enums<"subscription_status"> }> {
  const status = await markSubscriptionLapsedIfExpired(supabase, userId)
  return { ok: status === "active", status }
}

export async function getSubscriptionSnapshot(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<SubscriptionSnapshot> {
  await markSubscriptionLapsedIfExpired(supabase, userId)

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
