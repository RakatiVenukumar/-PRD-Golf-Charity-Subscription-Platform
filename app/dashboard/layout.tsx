import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { LogoutButton } from "@/components/forms/logout-button"
import { createSupabaseServerClient } from "@/lib/supabase"

type DashboardLayoutProps = {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const userEmail = session.user.email ?? "Unknown user"

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <div className="space-y-4">
          <DashboardSidebar userEmail={userEmail} />
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <LogoutButton />
          </div>
        </div>
        <div>{children}</div>
      </div>
    </main>
  )
}
