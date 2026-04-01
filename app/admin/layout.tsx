import Link from "next/link"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { LogoutButton } from "@/components/forms/logout-button"
import { isAdminEmail } from "@/lib/admin"
import { createSupabaseServerClient } from "@/lib/supabase"

type AdminLayoutProps = {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  if (!isAdminEmail(session.user.email)) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin control panel</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900">Platform Administration</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                User dashboard
              </Link>
              <LogoutButton />
            </div>
          </div>
        </header>
        {children}
      </div>
    </main>
  )
}
