"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type PublicCharity = {
  id: string
  name: string
  description: string
  featured: boolean
  image_url?: string | null
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
}

const riseIn = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function Home() {
  const [charities, setCharities] = useState<PublicCharity[]>([])

  useEffect(() => {
    let cancelled = false

    const loadCharities = async () => {
      try {
        const response = await fetch("/api/public/charities", { cache: "no-store" })
        if (!response.ok) return

        const payload = (await response.json()) as { charities?: PublicCharity[] }

        if (!cancelled) {
          setCharities(payload.charities ?? [])
        }
      } catch {
        if (!cancelled) {
          setCharities([])
        }
      }
    }

    void loadCharities()

    return () => {
      cancelled = true
    }
  }, [])

  const spotlightCharity = charities.find((charity) => charity.featured) ?? charities[0] ?? null

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.35),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(16,185,129,0.35),transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <section className="mx-auto w-full max-w-7xl px-5 pb-14 pt-8 sm:px-8 lg:px-10 lg:pb-20 lg:pt-10">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <motion.p
            whileHover={{ y: -1, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700"
          >
            Digital Heroes MVP
          </motion.p>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.18 }}>
              <Link href="/login" className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-slate-700 transition hover:bg-white/60">
                Sign in
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2, scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Link href="/signup" className="inline-flex h-10 items-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_10px_30px_-15px_rgba(15,23,42,0.8)] transition hover:bg-slate-700">
                Subscribe now
              </Link>
            </motion.div>
          </div>
        </motion.header>

        <div className="mt-10 grid items-start gap-8 lg:mt-14 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-7"
          >
            <motion.p variants={riseIn} className="font-mono text-xs uppercase tracking-[0.25em] text-slate-600">
              Impact-first subscriptions
            </motion.p>
            <motion.h1 variants={riseIn} className="font-heading text-5xl leading-[0.96] text-slate-900 sm:text-6xl lg:text-7xl">
              Subscribe once. Change lives every month.
            </motion.h1>
            <motion.p variants={riseIn} className="max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg">
              Choose a charity, set your contribution percentage, and join monthly reward draws. Every active subscription
              funds real causes while giving members a transparent way to participate, win, and track outcomes.
            </motion.p>

            <motion.div variants={riseIn} className="flex flex-wrap gap-3">
              <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center rounded-full bg-slate-900 px-7 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(15,23,42,0.95)] transition hover:translate-y-[-1px] hover:bg-slate-700"
                >
                  Subscribe and support a cause
                </Link>
              </motion.div>
              <motion.a
                href="#how-it-works"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                How it works
              </motion.a>
            </motion.div>

            <motion.div variants={riseIn} className="grid gap-3 sm:grid-cols-3">
              <motion.article whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur">
                <p className="font-mono text-xs uppercase tracking-wide text-slate-500">Cause commitment</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">10%+</p>
                <p className="text-xs text-slate-600">Minimum contribution from each subscription</p>
              </motion.article>
              <motion.article whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur">
                <p className="font-mono text-xs uppercase tracking-wide text-slate-500">Monthly reward cycle</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">1x</p>
                <p className="text-xs text-slate-600">Transparent draws with tracked winner verification</p>
              </motion.article>
              <motion.article whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur">
                <p className="font-mono text-xs uppercase tracking-wide text-slate-500">Prize model</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">40/35/25</p>
                <p className="text-xs text-slate-600">Predefined and automated tier distribution</p>
              </motion.article>
            </motion.div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.7)] backdrop-blur"
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">Impact spotlight</p>
            <h2 className="mt-3 font-heading text-3xl text-slate-900">Real subscriptions. Real outcomes.</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              This is not a traditional sports site. The core experience is contribution, transparency, and trust. Participation
              mechanics exist to sustain monthly impact and keep supporters engaged.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-slate-100">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-300">Featured campaign</p>
              <p className="mt-2 text-lg font-semibold">{spotlightCharity ? spotlightCharity.name : "Spotlight charity"}</p>
              <p className="mt-2 text-sm text-slate-300">
                {spotlightCharity
                  ? spotlightCharity.description
                  : "Featured charity details will appear here when admins publish spotlight causes."}
              </p>
              <Link
                href="/charities"
                className="mt-4 inline-flex rounded-full border border-slate-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 hover:bg-slate-800"
              >
                Explore directory
              </Link>
            </div>
          </motion.aside>
        </div>

        <motion.section
          id="how-it-works"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.22 }}
          className="mt-14 grid gap-4 md:grid-cols-3"
        >
          <motion.article variants={riseIn} whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">01 What you do</p>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">Subscribe and choose your charity</h3>
            <p className="mt-2 text-sm text-slate-600">Set your contribution percentage and support a cause from day one.</p>
          </motion.article>
          <motion.article variants={riseIn} whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">02 How you win</p>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">Participate in monthly draws</h3>
            <p className="mt-2 text-sm text-slate-600">Draw logic, winner verification, and payout states are visible and auditable.</p>
          </motion.article>
          <motion.article variants={riseIn} whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">03 Why it matters</p>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">Track your charity impact monthly</h3>
            <p className="mt-2 text-sm text-slate-600">Your subscription powers contributions and community initiatives with measurable reporting.</p>
          </motion.article>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mt-14 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_22px_56px_-40px_rgba(15,23,42,0.95)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Ready to begin?</p>
              <h3 className="text-2xl font-semibold text-slate-900">Start a subscription that funds impact and rewards participation.</h3>
            </div>
            <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/signup"
                className="inline-flex h-12 items-center rounded-full bg-emerald-600 px-7 text-sm font-semibold text-white shadow-[0_16px_35px_-20px_rgba(5,150,105,0.95)] transition hover:bg-emerald-500"
              >
                Subscribe now
              </Link>
            </motion.div>
          </div>
        </motion.section>

        <section className="mt-14 space-y-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Explore charities</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Support one of our listed charity partners</h3>
            <p className="mt-1 text-sm text-slate-600">Public users can browse available causes before subscribing.</p>
            <Link href="/charities" className="mt-2 inline-flex text-sm font-medium text-slate-900 underline">
              Open full charity directory
            </Link>
          </div>

          {charities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-4 text-sm text-slate-600">
              Charity listings will appear here once published by admins.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {charities.map((charity) => (
                <article key={charity.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-slate-900">{charity.name}</p>
                    {charity.featured ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{charity.description}</p>
                  <Link
                    href={`/charities/${charity.id}`}
                    className="mt-3 inline-flex text-xs font-semibold uppercase tracking-wide text-slate-900 underline"
                  >
                    View charity profile
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <motion.div
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.45 }}
        className="fixed inset-x-4 bottom-4 z-20 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_24px_50px_-30px_rgba(15,23,42,1)] backdrop-blur sm:hidden"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-slate-700">Lead with impact. Join the monthly contribution cycle.</p>
          <Link href="/signup" className="inline-flex h-9 items-center rounded-full bg-slate-900 px-4 text-xs font-semibold text-white">
            Subscribe
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
