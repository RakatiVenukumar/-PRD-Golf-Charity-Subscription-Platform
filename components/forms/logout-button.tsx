"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { logoutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    setError(null)

    startTransition(async () => {
      const result = await logoutAction()

      if (!result.success) {
        setError(result.error ?? "Logout failed")
        return
      }

      router.push("/login")
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" onClick={handleLogout} disabled={isPending}>
        {isPending ? "Signing out..." : "Sign out"}
      </Button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  )
}
