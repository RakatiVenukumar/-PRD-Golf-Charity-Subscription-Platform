"use client"

import { useState, useTransition } from "react"

import { subscribeAction } from "@/app/actions/subscription"
import { Button } from "@/components/ui/button"

type SubscriptionPlansProps = {
  currentStatus: string
  renewalDate: string | null
  currentPlan: "monthly" | "yearly" | null
  latestPaymentAmount: number | null
  latestPaymentStatus: string | null
}

const planCards = [
  {
    planType: "monthly" as const,
    title: "Monthly",
    price: "$29",
    subtitle: "Billed monthly",
    accent: "from-slate-900 to-slate-700",
  },
  {
    planType: "yearly" as const,
    title: "Yearly",
    price: "$299",
    subtitle: "Billed yearly, best value",
    accent: "from-emerald-700 to-emerald-500",
  },
]

export function SubscriptionPlans({
  currentStatus,
  renewalDate,
  currentPlan,
  latestPaymentAmount,
  latestPaymentStatus,
}: SubscriptionPlansProps) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubscribe = (planType: "monthly" | "yearly") => {
    setServerError(null)
    setSuccessMessage(null)

    startTransition(async () => {
      const result = await subscribeAction({ planType })

      if (!result.success) {
        setServerError(result.error ?? "Unable to activate subscription")
        return
      }

      setSuccessMessage(result.message ?? "Subscription activated.")
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
          <p className="mt-1 text-sm font-semibold capitalize text-slate-900">{currentStatus}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Current plan</p>
          <p className="mt-1 text-sm font-semibold capitalize text-slate-900">{currentPlan ?? "Not active"}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Renewal</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{renewalDate ?? "Not set"}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {planCards.map((plan) => {
          const isCurrentPlan = currentPlan === plan.planType && currentStatus === "active"

          return (
            <article key={plan.planType} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${plan.accent}`} />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">{plan.title}</p>
                <p className="text-2xl font-bold text-slate-900">{plan.price}</p>
                <p className="text-xs text-slate-500">{plan.subtitle}</p>
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  className="w-full"
                  variant={plan.planType === "yearly" ? "default" : "outline"}
                  disabled={isPending}
                  onClick={() => handleSubscribe(plan.planType)}
                >
                  {isCurrentPlan ? "Renew now" : `Choose ${plan.title}`}
                </Button>
              </div>
            </article>
          )
        })}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p>
          Latest payment:{" "}
          <span className="font-semibold text-slate-900">
            {latestPaymentAmount !== null ? `$${latestPaymentAmount}` : "No payment yet"}
          </span>
          {latestPaymentStatus ? ` (${latestPaymentStatus})` : ""}
        </p>
      </div>

      {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}
      {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}
    </div>
  )
}
