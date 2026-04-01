"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { updateProfileAction } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"

type CharityOption = {
  id: string
  name: string
  description: string
  image_url: string | null
  featured: boolean
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  charityId: z.string().nullable(),
  charityPercentage: z.coerce
    .number({ message: "Charity percentage is required" })
    .min(10, "Minimum charity contribution is 10%")
    .max(100, "Maximum charity contribution is 100%"),
})

type ProfileFormInput = z.input<typeof profileSchema>
type ProfileFormValues = z.output<typeof profileSchema>

type ProfileFormProps = {
  defaultName: string
  defaultCharityId: string | null
  defaultCharityPercentage: number
  charityOptions: CharityOption[]
}

export function ProfileForm({
  defaultName,
  defaultCharityId,
  defaultCharityPercentage,
  charityOptions,
}: ProfileFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: defaultName,
      charityId: defaultCharityId,
      charityPercentage: defaultCharityPercentage,
    },
  })

  const onSubmit = (values: ProfileFormValues) => {
    setServerError(null)

    startTransition(async () => {
      const result = await updateProfileAction({
        name: values.name,
        charityId: values.charityId,
        charityPercentage: values.charityPercentage,
      })

      if (!result.success) {
        setServerError(result.error ?? "Unable to update profile")
        return
      }

      router.refresh()
    })
  }

  const selectedCharityId = watch("charityId")
  const charityPercentage = watch("charityPercentage")
  const charityPercentageValue = Number(charityPercentage ?? defaultCharityPercentage)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-800">
          Name
        </label>
        <input
          id="name"
          type="text"
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
          {...register("name")}
        />
        {errors.name ? <p className="text-xs text-rose-600">{errors.name.message}</p> : null}
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
            No charities available yet. Admin can add charities later.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {charityOptions.map((option) => {
              const isActive = selectedCharityId === option.id

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setValue("charityId", option.id, { shouldDirty: true })}
                  className={[
                    "group relative overflow-hidden rounded-xl border p-3 text-left transition",
                    isActive
                      ? "border-emerald-500 bg-emerald-50 shadow-[0_8px_20px_-12px_rgba(16,185,129,0.6)]"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
                      {option.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{option.name}</p>
                        {option.featured ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                            Featured
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">{option.description}</p>
                    </div>
                  </div>
                  {isActive ? (
                    <span className="mt-3 inline-flex rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Selected
                    </span>
                  ) : null}
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

      <Button type="submit" disabled={isPending || !isDirty}>
        {isPending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  )
}
