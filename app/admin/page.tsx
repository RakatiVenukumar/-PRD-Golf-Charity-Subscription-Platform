import { redirect } from "next/navigation"

import { AdminCharityManager } from "@/components/admin/admin-charity-manager"
import { AdminDrawManager } from "@/components/admin/admin-draw-manager"
import { AdminScoreTable } from "@/components/admin/admin-score-table"
import { AdminUserTable } from "@/components/admin/admin-user-table"
import { AdminWinnerTable } from "@/components/admin/admin-winner-table"
import { isAdminEmail } from "@/lib/admin"
import { createSupabaseServerClient } from "@/lib/supabase"
import { getRecentScoresForAdmin } from "@/services/adminScoreService"
import { getAdminUsers } from "@/services/adminUserService"
import { getCharities } from "@/services/charityService"
import { getRecentDraws } from "@/services/drawService"
import { getRecentWinners } from "@/services/winnerService"

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/login")
  }

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard")
  }

  const users = await getAdminUsers(supabase)
  const charities = await getCharities(supabase)
  const draws = await getRecentDraws(supabase)
  const winners = await getRecentWinners(supabase)
  const scores = await getRecentScoresForAdmin(supabase)
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, status, created_at, user_id")
    .order("created_at", { ascending: false })
  const { data: profileCharityRows } = await supabase
    .from("profiles")
    .select("id, charity_id, charity_percentage")
  const visibleUsers = users.filter((user) => !isAdminEmail(user.email))
  const activeUsers = visibleUsers.filter((user) => user.subscription_status === "active").length
  const featuredCharities = charities.filter((charity) => charity.featured).length
  const paidWinners = winners.filter((winner) => winner.status === "paid").length
  const paidPayments = (payments ?? []).filter((payment) => payment.status === "paid")
  const totalRevenue = paidPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalPrizePool = winners.reduce((sum, winner) => sum + winner.prize_amount, 0)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthlyRevenue = paidPayments
    .filter((payment) => payment.created_at.slice(0, 7) === currentMonth)
    .reduce((sum, payment) => sum + payment.amount, 0)
  const publishedDrawsCount = draws.filter((draw) => draw.status === "published").length
  const draftDrawsCount = draws.filter((draw) => draw.status === "draft").length
  const jackpotRolloverDraws = draws.filter((draw) => draw.jackpot_rollover).length
  const totalDrawsCount = draws.length
  const avgPrizeAmount = winners.length
    ? winners.reduce((sum, winner) => sum + winner.prize_amount, 0) / winners.length
    : 0
  const activeRate = visibleUsers.length ? (activeUsers / visibleUsers.length) * 100 : 0

  const charityMap = new Map(charities.map((charity) => [charity.id, charity.name]))
  const profileCharityMap = new Map(
    (profileCharityRows ?? []).map((entry) => [
      entry.id,
      {
        charityId: entry.charity_id,
        charityPercentage: entry.charity_percentage,
      },
    ]),
  )
  const charityContributionTotals = new Map<string, number>()

  for (const payment of paidPayments) {
    const profile = profileCharityMap.get(payment.user_id)
    if (!profile?.charityId) {
      continue
    }

    const contributionAmount = (payment.amount * profile.charityPercentage) / 100
    charityContributionTotals.set(
      profile.charityId,
      (charityContributionTotals.get(profile.charityId) ?? 0) + contributionAmount,
    )
  }

  const totalCharityContribution = Array.from(charityContributionTotals.values()).reduce(
    (sum, amount) => sum + amount,
    0,
  )
  const topCharityContribution = Array.from(charityContributionTotals.entries())
    .sort((a, b) => b[1] - a[1])[0]

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total users</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{visibleUsers.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active subscribers</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">{activeUsers}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Inactive / lapsed</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{visibleUsers.length - activeUsers}</p>
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
        <AdminUserTable users={visibleUsers} />
      </article>

      <article className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Score Management</h2>
          <p className="text-sm text-slate-600">Review and edit user golf score entries.</p>
        </div>
        <AdminScoreTable scores={scores} />
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

      <article className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Reports & Analytics</h2>
          <p className="text-sm text-slate-600">Operational and financial metrics for subscriptions, draws, and payouts.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total revenue</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total prize pool</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">${totalPrizePool.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Revenue this month</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">${monthlyRevenue.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Charity contribution totals</p>
            <p className="mt-1 text-xl font-semibold text-emerald-700">${totalCharityContribution.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Active subscriber rate</p>
            <p className="mt-1 text-xl font-semibold text-emerald-700">{activeRate.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Draw statistics</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{totalDrawsCount} total</p>
            <p className="text-xs text-slate-600">{publishedDrawsCount} published / {draftDrawsCount} draft</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Jackpot rollovers</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{jackpotRolloverDraws}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Avg winner payout</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">${avgPrizeAmount.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Top charity by contribution</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {topCharityContribution ? (charityMap.get(topCharityContribution[0]) ?? "Unknown") : "N/A"}
            </p>
            <p className="text-xs text-slate-600">
              {topCharityContribution ? `$${topCharityContribution[1].toFixed(2)}` : "No contributions yet"}
            </p>
          </div>
        </div>
      </article>
    </section>
  )
}
