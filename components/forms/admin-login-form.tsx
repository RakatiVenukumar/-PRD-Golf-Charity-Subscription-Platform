"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { adminLoginAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"

const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>

export function AdminLoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: AdminLoginFormValues) => {
    setServerError(null)

    startTransition(async () => {
      const result = await adminLoginAction(values)

      if (!result.success) {
        setServerError(result.error ?? "Unable to log in")
        return
      }

      router.replace(result.redirectTo ?? "/admin")
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Admin sign in</h1>
        <p className="text-sm text-slate-600">Use an admin email to access the platform administration panel.</p>
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
          autoComplete="current-password"
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
          {...register("password")}
        />
        {errors.password ? <p className="text-xs text-rose-600">{errors.password.message}</p> : null}
      </div>

      {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Signing in..." : "Admin sign in"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        User login?{" "}
        <Link className="font-medium text-slate-900 underline" href="/login">
          Go to user sign in
        </Link>
      </p>
    </form>
  )
}