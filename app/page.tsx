import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-2xl rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Golf Charity Subscription Platform</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Subscription golf draws with real charity impact</h1>
        <p className="mt-4 text-base text-slate-600">
          Create an account to enter scores, join monthly draws, and support your chosen charity.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            Sign in
          </Link>
        </div>
      </section>
    </main>
  )
}
