import Link from "next/link"
import { redirect } from "next/navigation"

import { LoginForm } from "@/components/forms/login-form"
import { getPostLoginRedirectPath } from "@/lib/admin"
import { createSupabaseServerClient } from "@/lib/supabase"

type LoginPageProps = {
  searchParams?: Promise<{
    message?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const params = searchParams ? await searchParams : undefined
  const message = params?.message === "confirm-email"
    ? "Account created. Please confirm your email before signing in."
    : null

  if (user) {
    redirect(getPostLoginRedirectPath(user.email))
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md space-y-4">
        <LoginForm initialMessage={message} />
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
