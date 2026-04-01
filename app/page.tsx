import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.35),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(16,185,129,0.35),transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <section className="mx-auto w-full max-w-7xl px-5 pb-14 pt-8 sm:px-8 lg:px-10 lg:pb-20 lg:pt-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <p className="rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
            Digital Heroes MVP
          </p>
          <div className="flex items-center gap-2">
            <Link href="/login" className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-slate-700 transition hover:bg-white/60">
              Sign in
            </Link>
            <Link href="/signup" className="inline-flex h-10 items-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_10px_30px_-15px_rgba(15,23,42,0.8)] transition hover:bg-slate-700">
              Subscribe now
            </Link>
          </div>
        </header>

        <div className="mt-10 grid items-start gap-8 lg:mt-14 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-7">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-slate-600">Play with purpose</p>
            <h1 className="font-heading text-5xl leading-[0.96] text-slate-900 sm:text-6xl lg:text-7xl">
              Every score you submit can fund real-world impact.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg">
              Join a subscription platform where golf performance, monthly draw excitement, and charity support work
              together. Enter your latest scores, compete for prize pools, and channel part of every subscription to a
              cause you choose.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_14px_34px_-15px_rgba(15,23,42,0.9)] transition hover:translate-y-[-1px] hover:bg-slate-700"
              >
                Start your subscription
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                See how it works
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur">
                <p className="font-mono text-xs uppercase tracking-wide text-slate-500">Score window</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">5</p>
                <p className="text-xs text-slate-600">Latest Stableford scores retained</p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur">
                <p className="font-mono text-xs uppercase tracking-wide text-slate-500">Prize split</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">40/35/25</p>
                <p className="text-xs text-slate-600">Tiered draw distribution model</p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur">
                <p className="font-mono text-xs uppercase tracking-wide text-slate-500">Charity floor</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">10%</p>
                <p className="text-xs text-slate-600">Minimum contribution from subscription</p>
              </article>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.7)] backdrop-blur">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">Impact spotlight</p>
            <h2 className="mt-3 font-heading text-3xl text-slate-900">Your round can back the next charity event.</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              Pick a charity while signing up, choose your contribution percentage, and watch your subscription create
              monthly momentum for the causes that matter to you.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-slate-100">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-300">Featured campaign</p>
              <p className="mt-2 text-lg font-semibold">Junior Golf Access Program</p>
              <p className="mt-2 text-sm text-slate-300">
                Funding equipment grants and community training days for first-time young golfers.
              </p>
            </div>
          </aside>
        </div>

        <section id="how-it-works" className="mt-14 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">01 Subscribe</p>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">Choose monthly or yearly plan</h3>
            <p className="mt-2 text-sm text-slate-600">Activate your account and set your charity contribution percentage.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">02 Enter scores</p>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">Submit your latest Stableford rounds</h3>
            <p className="mt-2 text-sm text-slate-600">The platform automatically keeps your latest five scores, newest first.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">03 Win and verify</p>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">Monthly draws and payout workflow</h3>
            <p className="mt-2 text-sm text-slate-600">If you win, upload score proof and track status from pending to paid.</p>
          </article>
        </section>
      </section>
    </main>
  )
}
