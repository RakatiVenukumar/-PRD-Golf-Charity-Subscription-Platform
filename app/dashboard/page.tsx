import { redirect } from "next/navigation"

import { LogoutButton } from "@/components/forms/logout-button"
import { ProfileForm } from "@/components/forms/profile-form"
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
  const userEmail = session.user.email ?? "Unknown user"

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Signed in as {userEmail}</p>
        <div className="mt-6 rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
          <p className="mb-4 mt-1 text-sm text-slate-600">Manage your display name, selected charity, and contribution percentage.</p>
          <ProfileForm
            defaultName={profile.name}
            defaultCharityId={profile.charity_id}
            defaultCharityPercentage={profile.charity_percentage}
            charityOptions={charityOptions}
          />
        </div>
        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    </main>
  )
}
