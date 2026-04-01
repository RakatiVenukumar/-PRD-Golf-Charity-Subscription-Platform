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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <div className="space-y-2">
        <label htmlFor="charityId" className="text-sm font-medium text-slate-800">
          Selected charity
        </label>
        <select
          id="charityId"
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
          {...register("charityId")}
        >
          <option value="">No charity selected</option>
          {charityOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        {charityOptions.length === 0 ? (
          <p className="text-xs text-amber-700">No charities available yet. Admin can add charities later.</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="charityPercentage" className="text-sm font-medium text-slate-800">
          Charity contribution (%)
        </label>
        <input
          id="charityPercentage"
          type="number"
          min={10}
          max={100}
          step={1}
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
          {...register("charityPercentage")}
        />
        {errors.charityPercentage ? <p className="text-xs text-rose-600">{errors.charityPercentage.message}</p> : null}
      </div>

      {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}

      <Button type="submit" disabled={isPending || !isDirty}>
        {isPending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  )
}
