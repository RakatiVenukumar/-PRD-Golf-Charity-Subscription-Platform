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
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  charityId: z.string().nullable(),
  charityPercentage: z.coerce
    .number({ message: "Charity percentage is required" })
    .min(10, "Minimum charity contribution is 10%")
    .max(100, "Maximum charity contribution is 100%"),
})

type SignupFormInput = z.input<typeof signupSchema>
type SignupFormValues = z.output<typeof signupSchema>

type CharityOption = {
  id: string
  name: string
  description: string
  image_url: string | null
  featured: boolean
}

type SignupFormProps = {
  charityOptions: CharityOption[]
}

export function SignupForm({ charityOptions }: SignupFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<SignupFormInput, unknown, SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      charityId: null,
      charityPercentage: 10,
    },
  })

  const onSubmit = (values: SignupFormValues) => {
    setServerError(null)

    if (charityOptions.length > 0 && !values.charityId) {
      setError("charityId", { message: "Select a charity to continue" })
      return
    }

    startTransition(async () => {
      const result = await signupAction(values)

      if (!result.success) {
        setServerError(result.error ?? "Unable to create account")
        return
      }

      if (result.requiresEmailConfirmation) {
        router.push("/login?message=confirm-email")
        return
      }

      router.replace("/dashboard")
    })
  }

  const selectedCharityId = watch("charityId")
  const charityPercentage = watch("charityPercentage")
  const charityPercentageValue = Number(charityPercentage ?? 10)

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

      <input type="hidden" {...register("charityId")} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-800">Choose your charity</label>
          {selectedCharityId ? (
            <button
              type="button"
              className="text-xs font-medium text-slate-600 underline hover:text-slate-900"
              onClick={() => setValue("charityId", "", { shouldDirty: true })}
            >
              Clear selection
            </button>
          ) : null}
        </div>

        {charityOptions.length === 0 ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            No charities available yet. You can complete signup and choose later in your profile.
          </p>
        ) : (
          <div className="grid gap-2">
            {charityOptions.map((option) => {
              const isActive = selectedCharityId === option.id

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setValue("charityId", option.id, { shouldDirty: true })}
                  className={[
                    "rounded-xl border p-3 text-left transition",
                    isActive
                      ? "border-emerald-500 bg-emerald-50 shadow-[0_8px_20px_-12px_rgba(16,185,129,0.6)]"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{option.name}</p>
                    {option.featured ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">{option.description}</p>
                </button>
              )
            })}
          </div>
        )}

        {errors.charityId ? <p className="text-xs text-rose-600">{errors.charityId.message}</p> : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="charityPercentage" className="text-sm font-medium text-slate-800">
            Charity contribution
          </label>
          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
            {charityPercentageValue}%
          </span>
        </div>
        <input
          id="charityPercentage"
          type="range"
          min={10}
          max={100}
          step={1}
          className="w-full accent-emerald-600"
          {...register("charityPercentage")}
        />
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>Min 10%</span>
          <span>Max 100%</span>
        </div>
        {errors.charityPercentage ? <p className="mt-2 text-xs text-rose-600">{errors.charityPercentage.message}</p> : null}
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
