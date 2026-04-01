import { redirect } from "next/navigation"

import { SectionCard } from "@/components/dashboard/section-card"
import { ProfileForm } from "@/components/forms/profile-form"
import { ScoreEntryForm } from "@/components/forms/score-entry-form"
import { createSupabaseServerClient } from "@/lib/supabase"
import { getCharityOptions, getOrCreateProfile } from "@/services/profileService"

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
          description="Current plan state and renewal details."
        >
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Status: <span className="font-medium capitalize">{profile.subscription_status}</span>
            </p>
            <p>
              Renewal date: <span className="font-medium">{profile.renewal_date ?? "Not set"}</span>
            </p>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard id="scores" title="Score Entry" description="Add your latest Stableford score and date.">
          <ScoreEntryForm />
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
