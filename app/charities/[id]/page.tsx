import Link from "next/link"
import { notFound } from "next/navigation"

import { IndependentDonationForm } from "@/components/forms/independent-donation-form"
import { createSupabaseServerClient } from "@/lib/supabase"
import { getCharityById, getPublicCharities, getUpcomingCharityEvents } from "@/services/charityService"

type CharityProfilePageProps = {
  params: Promise<{ id: string }>
}

export default async function CharityProfilePage({ params }: CharityProfilePageProps) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const charity = await getCharityById(supabase, id)

  if (!charity) {
    notFound()
  }

  const events = await getUpcomingCharityEvents(supabase, charity.id)
  const donationCharities = await getPublicCharities(supabase, { limit: 100 })

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-5xl space-y-6">
        <Link href="/charities" className="inline-flex text-sm font-medium text-slate-700 underline">
          Back to directory
        </Link>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold text-slate-900">{charity.name}</h1>
            {charity.featured ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                Featured / Spotlight
              </span>
            ) : null}
          </div>

          {charity.image_url ? (
            <div
              className="mt-4 h-56 rounded-xl bg-cover bg-center"
              style={{ backgroundImage: `url(${charity.image_url})` }}
              aria-hidden="true"
            />
          ) : null}

          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">{charity.description}</p>
        </article>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Upcoming Events</h2>
          <p className="mt-1 text-sm text-slate-600">Golf days and upcoming activities for this charity.</p>

          {events.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              No upcoming events listed yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {events.map((event) => (
                <article key={event.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{event.event_date}</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{event.title}</h3>
                  {event.location ? <p className="mt-1 text-xs text-slate-500">{event.location}</p> : null}
                  {event.description ? <p className="mt-2 text-sm text-slate-600">{event.description}</p> : null}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Independent Donation</h2>
          <p className="mt-1 text-sm text-slate-600">Donate directly to any listed charity without gameplay or subscription dependency.</p>
          <div className="mt-4">
            <IndependentDonationForm charities={donationCharities.map((item) => ({ id: item.id, name: item.name }))} defaultCharityId={charity.id} />
          </div>
        </section>
      </section>
    </main>
  )
}
