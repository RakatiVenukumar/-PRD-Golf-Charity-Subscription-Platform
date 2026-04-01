"use client"

import Link from "next/link"
import { useEffect } from "react"

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error boundary captured:", error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(248,113,113,0.25),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.25),transparent_45%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] px-5 py-10">
          <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/95 p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.75)] backdrop-blur">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">Unexpected error</p>
            <h1 className="mt-3 font-heading text-4xl text-slate-900 sm:text-5xl">Something went wrong</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              The app hit an unexpected error. You can retry this action or return to a safe page and continue.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Retry
              </button>
              <Link
                href="/"
                className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Back to home
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Open dashboard
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  )
}
