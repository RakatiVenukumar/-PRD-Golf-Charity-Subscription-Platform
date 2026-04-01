import Link from "next/link"
import { redirect } from "next/navigation"

import { LoginForm } from "@/components/forms/login-form"
import { createSupabaseServerClient } from "@/lib/supabase"

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getSession()

  if (data.session) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md space-y-4">
        <LoginForm />
        <p className="text-center text-sm text-slate-600">
          Back to{" "}
          <Link className="font-medium text-slate-900 underline" href="/">
            home
          </Link>
        </p>
      </div>
    </main>
  )
}
