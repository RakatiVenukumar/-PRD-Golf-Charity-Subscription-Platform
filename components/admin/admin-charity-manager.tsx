"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  createCharityAction,
  deleteCharityAction,
  updateCharityAction,
} from "@/app/actions/admin-charities"
import { Button } from "@/components/ui/button"

type Charity = {
  id: string
  name: string
  description: string
  image_url: string | null
  featured: boolean
  created_at: string
}

type AdminCharityManagerProps = {
  charities: Charity[]
}

const charitySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  imageUrl: z.string().url("Invalid image URL").or(z.literal("")),
  featured: z.boolean(),
})

type CharityInput = z.infer<typeof charitySchema>

function toInput(charity: Charity): CharityInput {
  return {
    name: charity.name,
    description: charity.description,
    imageUrl: charity.image_url ?? "",
    featured: charity.featured,
  }
}

export function AdminCharityManager({ charities }: AdminCharityManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedId, setSelectedId] = useState<string | "new">("new")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedCharity = useMemo(
    () => charities.find((charity) => charity.id === selectedId) ?? null,
    [charities, selectedId],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CharityInput>({
    resolver: zodResolver(charitySchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      featured: false,
    },
  })

  const beginCreate = () => {
    setSelectedId("new")
    setFeedback(null)
    setError(null)
    reset({ name: "", description: "", imageUrl: "", featured: false })
  }

  const beginEdit = (charity: Charity) => {
    setSelectedId(charity.id)
    setFeedback(null)
    setError(null)
    reset(toInput(charity))
  }

  const onSubmit = (values: CharityInput) => {
    setFeedback(null)
    setError(null)

    startTransition(async () => {
      if (selectedId === "new") {
        const result = await createCharityAction(values)
        if (!result.success) {
          setError(result.error ?? "Failed to create charity")
          return
        }

        setFeedback("Charity created successfully.")
        router.refresh()
        beginCreate()
        return
      }

      const result = await updateCharityAction({ charityId: selectedId, ...values })
      if (!result.success) {
        setError(result.error ?? "Failed to update charity")
        return
      }

      setFeedback("Charity updated successfully.")
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!selectedCharity) return

    setFeedback(null)
    setError(null)

    startTransition(async () => {
      const result = await deleteCharityAction({ charityId: selectedCharity.id })

      if (!result.success) {
        setError(result.error ?? "Failed to delete charity")
        return
      }

      setFeedback("Charity deleted successfully.")
      router.refresh()
      beginCreate()
    })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Charity List</h3>
          <Button size="sm" variant="outline" onClick={beginCreate}>
            New
          </Button>
        </div>
        <div className="space-y-2">
          {charities.length === 0 ? (
            <p className="text-sm text-slate-600">No charities yet.</p>
          ) : (
            charities.map((charity) => (
              <button
                key={charity.id}
                type="button"
                onClick={() => beginEdit(charity)}
                className={[
                  "w-full rounded-lg border px-3 py-2 text-left",
                  selectedId === charity.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50",
                ].join(" ")}
              >
                <p className="text-sm font-semibold text-slate-900">{charity.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-600">{charity.description}</p>
                {charity.featured ? (
                  <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    Featured
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          {selectedId === "new" ? "Create Charity" : "Edit Charity"}
        </h3>
        <p className="mt-1 text-sm text-slate-600">Manage charity content shown to subscribers.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800" htmlFor="charity-name">
              Name
            </label>
            <input
              id="charity-name"
              type="text"
              className="h-10 w-full rounded-lg border border-slate-300 px-3"
              {...register("name")}
            />
            {errors.name ? <p className="text-xs text-rose-600">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800" htmlFor="charity-description">
              Description
            </label>
            <textarea
              id="charity-description"
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              {...register("description")}
            />
            {errors.description ? <p className="text-xs text-rose-600">{errors.description.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800" htmlFor="charity-image">
              Image URL
            </label>
            <input
              id="charity-image"
              type="url"
              className="h-10 w-full rounded-lg border border-slate-300 px-3"
              {...register("imageUrl")}
            />
            {errors.imageUrl ? <p className="text-xs text-rose-600">{errors.imageUrl.message}</p> : null}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-800">
            <input type="checkbox" className="size-4 rounded border-slate-300" {...register("featured")} />
            Mark as featured charity
          </label>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {feedback ? <p className="text-sm text-emerald-700">{feedback}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : selectedId === "new" ? "Create charity" : "Update charity"}
            </Button>
            {selectedId !== "new" ? (
              <Button type="button" variant="destructive" disabled={isPending} onClick={handleDelete}>
                Delete charity
              </Button>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  )
}
