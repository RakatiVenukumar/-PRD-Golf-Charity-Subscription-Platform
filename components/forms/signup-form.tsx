"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { signupAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: SignupFormValues) => {
    setServerError(null)

    startTransition(async () => {
      const result = await signupAction(values)

      if (!result.success) {
        setServerError(result.error ?? "Unable to create account")
        return
      }

      router.push("/dashboard")
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-600">Start tracking scores, draws, and charity impact.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
          {...register("name")}
        />
        {errors.name ? <p className="text-xs text-rose-600">{errors.name.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
          {...register("email")}
        />
        {errors.email ? <p className="text-xs text-rose-600">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
          {...register("password")}
        />
        {errors.password ? <p className="text-xs text-rose-600">{errors.password.message}</p> : null}
      </div>

      {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-medium text-slate-900 underline" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  )
}
