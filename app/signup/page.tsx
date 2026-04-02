import Link from "next/link"
import { redirect } from "next/navigation"

import { SignupForm } from "@/components/forms/signup-form"
import { getPostLoginRedirectPath } from "@/lib/admin"
import { createSupabaseServerClient } from "@/lib/supabase"
import { getCharityOptions } from "@/services/profileService"

export default async function SignupPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect(getPostLoginRedirectPath(user.email))
  }

  const charityOptions = await getCharityOptions(supabase)

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md space-y-4">
        <SignupForm charityOptions={charityOptions} />
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
