import { AdminUserTable } from "@/components/admin/admin-user-table"
import { createSupabaseServerClient } from "@/lib/supabase"
import { getAdminUsers } from "@/services/adminUserService"

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const users = await getAdminUsers(supabase)
  const activeUsers = users.filter((user) => user.subscription_status === "active").length

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
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
      </div>

      <article className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-600">View and update profile names, subscription status, and renewal dates.</p>
        </div>
        <AdminUserTable users={users} />
      </article>
    </section>
  )
}
