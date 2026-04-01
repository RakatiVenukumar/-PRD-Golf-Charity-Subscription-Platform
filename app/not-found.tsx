import Link from "next/link"

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.3),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.3),transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-5 py-10">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.7)] backdrop-blur">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">Error 404</p>
        <h1 className="mt-3 font-heading text-4xl text-slate-900 sm:text-5xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
          The page you requested does not exist or has been moved. You can return to the landing page, sign in, or
          continue to your dashboard.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Go to dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
      </section>
    </main>
  )
}
