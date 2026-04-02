"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { createIndependentDonationAction } from "@/app/actions/donation"
import { Button } from "@/components/ui/button"

type CharityOption = {
  id: string
  name: string
}

const donationSchema = z.object({
  charityId: z.string().uuid("Please select a charity"),
  amount: z.coerce.number().min(1, "Donation amount must be at least $1"),
  donorName: z.string().max(120, "Donor name too long").optional(),
  donorEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  message: z.string().max(500, "Message too long").optional(),
})

type DonationFormInput = z.input<typeof donationSchema>
type DonationFormValues = z.output<typeof donationSchema>

type IndependentDonationFormProps = {
  charities: CharityOption[]
  defaultCharityId?: string | null
}

export function IndependentDonationForm({ charities, defaultCharityId = null }: IndependentDonationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const defaultValues = useMemo<DonationFormValues>(
    () => ({
      charityId: defaultCharityId && charities.some((option) => option.id === defaultCharityId)
        ? defaultCharityId
        : charities[0]?.id ?? "",
      amount: 25,
      donorName: "",
      donorEmail: "",
      message: "",
    }),
    [charities, defaultCharityId],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DonationFormInput, unknown, DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues,
  })

  const onSubmit = (values: DonationFormValues) => {
    setFeedback(null)
    setServerError(null)

    startTransition(async () => {
      const result = await createIndependentDonationAction({
        charityId: values.charityId,
        amount: values.amount,
        donorName: values.donorName?.trim() ? values.donorName.trim() : null,
        donorEmail: values.donorEmail?.trim() ? values.donorEmail.trim() : null,
        message: values.message?.trim() ? values.message.trim() : null,
      })

      if (!result.success) {
        setServerError(result.error ?? "Unable to submit donation")
        return
      }

      setFeedback("Donation submitted successfully.")
      reset({ ...defaultValues, amount: values.amount })
      router.refresh()
    })
  }

  if (charities.length === 0) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Donations are unavailable until at least one charity is listed.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="donation-charity" className="text-xs font-medium uppercase tracking-wide text-slate-600">
            Charity
          </label>
          <select
            id="donation-charity"
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            {...register("charityId")}
          >
            {charities.map((charity) => (
              <option key={charity.id} value={charity.id}>
                {charity.name}
              </option>
            ))}
          </select>
          {errors.charityId ? <p className="text-xs text-rose-600">{errors.charityId.message}</p> : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="donation-amount" className="text-xs font-medium uppercase tracking-wide text-slate-600">
            Amount (USD)
          </label>
          <input
            id="donation-amount"
            type="number"
            min={1}
            step={1}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            {...register("amount")}
          />
          {errors.amount ? <p className="text-xs text-rose-600">{errors.amount.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="donor-name" className="text-xs font-medium uppercase tracking-wide text-slate-600">
            Donor name (optional)
          </label>
          <input id="donor-name" type="text" className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" {...register("donorName")} />
        </div>
        <div className="space-y-1">
          <label htmlFor="donor-email" className="text-xs font-medium uppercase tracking-wide text-slate-600">
            Donor email (optional)
          </label>
          <input id="donor-email" type="email" className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" {...register("donorEmail")} />
          {errors.donorEmail ? <p className="text-xs text-rose-600">{errors.donorEmail.message}</p> : null}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="donor-message" className="text-xs font-medium uppercase tracking-wide text-slate-600">
          Message (optional)
        </label>
        <textarea id="donor-message" rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" {...register("message")} />
      </div>

      {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}
      {feedback ? <p className="text-sm text-emerald-700">{feedback}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Donate now"}
      </Button>
    </form>
  )
}
