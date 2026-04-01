import { redirect } from "next/navigation"

import { ScoreList } from "@/components/dashboard/score-list"
import { SectionCard } from "@/components/dashboard/section-card"
import { ProfileForm } from "@/components/forms/profile-form"
import { ScoreEntryForm } from "@/components/forms/score-entry-form"
import { SubscriptionPlans } from "@/components/forms/subscription-plans"
import { createSupabaseServerClient } from "@/lib/supabase"
import { getCharityOptions, getOrCreateProfile } from "@/services/profileService"
import { getLatestScores } from "@/services/scoreService"
import { getSubscriptionSnapshot } from "@/services/subscriptionService"

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const profile = await getOrCreateProfile(supabase, session.user)
  const charityOptions = await getCharityOptions(supabase)
  const latestScores = await getLatestScores(supabase, session.user.id)
  const subscriptionSnapshot = await getSubscriptionSnapshot(supabase, session.user.id)

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
          />
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard id="scores" title="Score Entry" description="Add your latest Stableford score and date.">
          <div className="space-y-6">
            <ScoreEntryForm />
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Latest 5 scores</h3>
              <ScoreList scores={latestScores} />
            </div>
          </div>
        </SectionCard>

        <SectionCard id="charity" title="Draw Participation" description="Track draw eligibility and upcoming draw cycle.">
          <p className="text-sm text-slate-600">Draw participation summary will be added in upcoming steps.</p>
        </SectionCard>

        <SectionCard id="winnings" title="Winnings Summary" description="Total winnings and payout status.">
          <p className="text-sm text-slate-600">Winnings module will be connected after draw and winner logic.</p>
        </SectionCard>
      </div>
    </div>
  )
}
