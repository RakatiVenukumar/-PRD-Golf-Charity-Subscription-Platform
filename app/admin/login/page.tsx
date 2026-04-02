import { redirect } from "next/navigation"

import { AdminLoginForm } from "@/components/forms/admin-login-form"
import { getPostLoginRedirectPath } from "@/lib/admin"
import { createSupabaseServerClient } from "@/lib/supabase"

export default async function AdminLoginPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect(getPostLoginRedirectPath(user.email))
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md space-y-4">
        <AdminLoginForm />
      </div>
    </main>
  )
}