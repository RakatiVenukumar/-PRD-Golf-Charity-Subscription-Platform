import Link from "next/link"

import { createSupabaseServerClient } from "@/lib/supabase"
import { getPublicCharities } from "@/services/charityService"

type CharityDirectoryPageProps = {
  searchParams?: Promise<{ q?: string; featured?: string }>
}

export default async function CharityDirectoryPage({ searchParams }: CharityDirectoryPageProps) {
  const params = (await searchParams) ?? {}
  const query = params.q?.trim() ?? ""
  const featuredOnly = params.featured === "1"

  const supabase = await createSupabaseServerClient()
  const charities = await getPublicCharities(supabase, {
    query,
    featuredOnly,
  })

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Charity Directory</p>
          <h1 className="text-3xl font-semibold text-slate-900">Explore and support verified charity partners</h1>
          <p className="text-sm text-slate-600">
            Search causes by keyword, filter featured charities, and open detailed profiles including upcoming events.
          </p>
        </header>

        <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto_auto]">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by name or cause"
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
          />
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm text-slate-700">
            <input type="checkbox" name="featured" value="1" defaultChecked={featuredOnly} className="size-4" />
            Featured only
          </label>
          <button type="submit" className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white">
            Apply
          </button>
        </form>

        {charities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            No charities match your filters right now.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {charities.map((charity) => (
              <article key={charity.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">{charity.name}</h2>
                  {charity.featured ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                      Featured
                    </span>
                  ) : null}
                </div>

                {charity.image_url ? (
                  <div
                    className="mt-3 h-36 rounded-xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${charity.image_url})` }}
                    aria-hidden="true"
                  />
                ) : null}

                <p className="mt-3 line-clamp-4 text-sm text-slate-600">{charity.description}</p>

                <Link
                  href={`/charities/${charity.id}`}
                  className="mt-4 inline-flex h-9 items-center rounded-full border border-slate-300 px-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  View profile
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
