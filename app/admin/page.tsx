import { AdminCharityManager } from "@/components/admin/admin-charity-manager"
import { AdminDrawManager } from "@/components/admin/admin-draw-manager"
import { AdminUserTable } from "@/components/admin/admin-user-table"
import { AdminWinnerTable } from "@/components/admin/admin-winner-table"
import { createSupabaseServerClient } from "@/lib/supabase"
import { getAdminUsers } from "@/services/adminUserService"
import { getCharities } from "@/services/charityService"
import { getRecentDraws } from "@/services/drawService"
import { getRecentWinners } from "@/services/winnerService"

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const users = await getAdminUsers(supabase)
  const charities = await getCharities(supabase)
  const draws = await getRecentDraws(supabase)
  const winners = await getRecentWinners(supabase)
  const activeUsers = users.filter((user) => user.subscription_status === "active").length
  const featuredCharities = charities.filter((charity) => charity.featured).length
  const paidWinners = winners.filter((winner) => winner.status === "paid").length

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total users</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{users.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active subscribers</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">{activeUsers}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Inactive / lapsed</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{users.length - activeUsers}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Charities / featured</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {charities.length} <span className="text-sm text-slate-500">/ {featuredCharities}</span>
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Winners / paid</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {winners.length} <span className="text-sm text-slate-500">/ {paidWinners}</span>
          </p>
        </article>
      </div>

      <article className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-600">View and update profile names, subscription status, and renewal dates.</p>
        </div>
        <AdminUserTable users={users} />
      </article>

      <article className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Charity Management</h2>
          <p className="text-sm text-slate-600">Create, update, and remove charity records shown across the platform.</p>
        </div>
        <AdminCharityManager charities={charities} />
      </article>

      <article className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Draw Management</h2>
          <p className="text-sm text-slate-600">Create drafts, run simulations, execute prize distribution, and publish monthly draws.</p>
        </div>
        <AdminDrawManager draws={draws} />
      </article>

      <article className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Winners Management</h2>
          <p className="text-sm text-slate-600">Track winner records, proof submissions, match tiers, and payout states.</p>
        </div>
        <AdminWinnerTable winners={winners} />
      </article>
    </section>
  )
}
