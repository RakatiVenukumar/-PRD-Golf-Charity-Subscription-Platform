"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { updateAdminUserAction } from "@/app/actions/admin-users"
import { Button } from "@/components/ui/button"

type AdminUser = {
  id: string
  name: string
  email: string
  subscription_status: "active" | "inactive" | "lapsed" | "canceled"
  renewal_date: string | null
  created_at: string
}

type AdminUserTableProps = {
  users: AdminUser[]
}

function formatDate(value: string | null) {
  if (!value) return "--"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function AdminUserTable({ users }: AdminUserTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [drafts, setDrafts] = useState<Record<string, { name: string; status: AdminUser["subscription_status"]; renewalDate: string }>>(
    () =>
      Object.fromEntries(
        users.map((user) => [
          user.id,
          {
            name: user.name,
            status: user.subscription_status,
            renewalDate: user.renewal_date ?? "",
          },
        ]),
      ),
  )

  const handleDraftChange = (
    userId: string,
    key: "name" | "status" | "renewalDate",
    value: string,
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [key]: value,
      },
    }))
  }

  const handleSave = (userId: string) => {
    const draft = drafts[userId]
    if (!draft) return

    setError(null)
    setEditingUserId(userId)

    startTransition(async () => {
      const result = await updateAdminUserAction({
        userId,
        name: draft.name,
        subscriptionStatus: draft.status,
        renewalDate: draft.renewalDate,
      })

      if (!result.success) {
        setError(result.error ?? "Failed to update user")
        setEditingUserId(null)
        return
      }

      router.refresh()
      setEditingUserId(null)
    })
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
        No users found yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-3 text-left font-semibold text-slate-700">User</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Email</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Renewal</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-700">Joined</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const draft = drafts[user.id]
              const isRowSaving = isPending && editingUserId === user.id

              return (
                <tr key={user.id}>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={draft?.name ?? ""}
                      onChange={(event) => handleDraftChange(user.id, "name", event.target.value)}
                      className="h-9 w-44 rounded-md border border-slate-300 px-2"
                    />
                  </td>
                  <td className="px-3 py-3 text-slate-700">{user.email}</td>
                  <td className="px-3 py-3">
                    <select
                      value={draft?.status ?? "inactive"}
                      onChange={(event) => handleDraftChange(user.id, "status", event.target.value)}
                      className="h-9 rounded-md border border-slate-300 px-2 capitalize"
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                      <option value="lapsed">lapsed</option>
                      <option value="canceled">canceled</option>
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="date"
                      value={draft?.renewalDate ?? ""}
                      onChange={(event) => handleDraftChange(user.id, "renewalDate", event.target.value)}
                      className="h-9 rounded-md border border-slate-300 px-2"
                    />
                  </td>
                  <td className="px-3 py-3 text-slate-700">{formatDate(user.created_at)}</td>
                  <td className="px-3 py-3 text-right">
                    <Button size="sm" onClick={() => handleSave(user.id)} disabled={isRowSaving}>
                      {isRowSaving ? "Saving..." : "Save"}
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
