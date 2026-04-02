import Link from "next/link"
import { redirect } from "next/navigation"

import { ScoreManager } from "@/components/dashboard/score-manager"
import { SectionCard } from "@/components/dashboard/section-card"
import { IndependentDonationForm } from "@/components/forms/independent-donation-form"
import { ProfileForm } from "@/components/forms/profile-form"
import { SubscriptionPlans } from "@/components/forms/subscription-plans"
import { WinnerProofUploader } from "@/components/forms/winner-proof-uploader"
import { createSupabaseServerClient } from "@/lib/supabase"
import { getCharityOptions, getOrCreateProfile } from "@/services/profileService"
import { getRecentDraws } from "@/services/drawService"
import { getLatestScores } from "@/services/scoreService"
import { finalizeStripeCheckout, getSubscriptionSnapshot } from "@/services/subscriptionService"
import { getUserWinners } from "@/services/winnerService"

type DashboardPageProps = {
  searchParams?: Promise<{ payment?: string; plan?: "monthly" | "yearly"; session_id?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login")
  }

  const params = searchParams ? await searchParams : undefined
  let paymentFeedback: string | null = null

  if (params?.payment === "success" && params.plan && params.session_id) {
    try {
      const finalized = await finalizeStripeCheckout(supabase, user.id, params.plan, params.session_id)
      paymentFeedback = finalized.activated
        ? `Payment confirmed. ${params.plan} subscription is active.`
        : "Payment pending confirmation."
    } catch {
      paymentFeedback = "Payment verification failed. Please contact support if you were charged."
    }
  }

  if (params?.payment === "canceled") {
    paymentFeedback = "Checkout canceled. Your subscription was not changed."
  }

  const profile = await getOrCreateProfile(supabase, user)
  const charityOptions = await getCharityOptions(supabase)
  const latestScores = await getLatestScores(supabase, user.id)
  const recentDraws = await getRecentDraws(supabase)
  const subscriptionSnapshot = await getSubscriptionSnapshot(supabase, user.id)
  const userWinners = await getUserWinners(supabase, user.id)
  const totalWon = userWinners.reduce((sum, winner) => sum + winner.prize_amount, 0)
  const paidCount = userWinners.filter((winner) => winner.status === "paid").length
  const publishedDraws = recentDraws.filter((draw) => draw.status === "published")
  const upcomingDraws = recentDraws.filter((draw) => draw.status === "draft")
  const latestPublishedDraw = publishedDraws[0] ?? null
  const isEligibleForDraw =
    subscriptionSnapshot.profileStatus === "active" &&
    latestScores.length > 0 &&
    profile.charity_id !== null
  const drawsEntered = isEligibleForDraw ? publishedDraws.length : 0

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Your subscription, score tracking, and charity impact in one place.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Profile"
          description="Manage your display name, selected charity, and contribution percentage."
        >
          <ProfileForm
            defaultName={profile.name}
            defaultCharityId={profile.charity_id}
            defaultCharityPercentage={profile.charity_percentage}
            charityOptions={charityOptions}
          />
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            Browse all causes and event details in the public directory at <Link href="/charities" className="font-medium text-slate-900 underline">/charities</Link>.
          </div>
        </SectionCard>

        <SectionCard
          title="Subscription Status"
          description="Choose a monthly or yearly plan with mock payment activation."
        >
          <SubscriptionPlans
            currentStatus={subscriptionSnapshot.profileStatus}
            renewalDate={subscriptionSnapshot.renewalDate}
            currentPlan={subscriptionSnapshot.currentPlan}
            latestPaymentAmount={subscriptionSnapshot.latestPayment?.amount ?? null}
            latestPaymentStatus={subscriptionSnapshot.latestPayment?.status ?? null}
            paymentFeedback={paymentFeedback}
          />
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard id="scores" title="Score Entry" description="Add your latest Stableford score and date.">
          <ScoreManager
            scores={latestScores}
            disabled={subscriptionSnapshot.profileStatus !== "active"}
          />
        </SectionCard>

        <SectionCard id="charity" title="Draw Participation" description="Track draw eligibility and recent draw activity.">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Current eligibility</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{isEligibleForDraw ? "Eligible" : "Not yet"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Draws entered</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{drawsEntered}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Upcoming draws</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{upcomingDraws.length}</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
              <p>
                Latest published draw date:{" "}
                <span className="font-medium text-slate-900">
                  {latestPublishedDraw ? latestPublishedDraw.draw_date : "No draw published yet"}
                </span>
              </p>
              {!isEligibleForDraw ? (
                <p className="mt-1 text-xs text-amber-700">
                  To qualify: activate subscription, save at least one score, and select a charity.
                </p>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard id="winnings" title="Winnings Summary" description="Total winnings and payout status.">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total won</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">${totalWon.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Wins</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{userWinners.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Paid</p>
                <p className="mt-1 text-lg font-semibold text-emerald-700">{paidCount}</p>
              </div>
            </div>

            <WinnerProofUploader
              userId={user.id}
              winners={userWinners}
              disabled={subscriptionSnapshot.profileStatus !== "active"}
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard
        id="independent-donation"
        title="Independent Donation"
        description="Donate directly to a listed charity without affecting draw eligibility or gameplay."
      >
        <IndependentDonationForm
          charities={charityOptions.map((charity) => ({ id: charity.id, name: charity.name }))}
          defaultCharityId={profile.charity_id}
        />
      </SectionCard>
    </div>
  )
}
