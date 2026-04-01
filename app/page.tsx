"use client"

import Link from "next/link"
import { motion } from "framer-motion"

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
              Play with purpose
            </motion.p>
            <motion.h1 variants={riseIn} className="font-heading text-5xl leading-[0.96] text-slate-900 sm:text-6xl lg:text-7xl">
              Every score you submit can fund real-world impact.
            </motion.h1>
            <motion.p variants={riseIn} className="max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg">
              Join a subscription platform where golf performance, monthly draw excitement, and charity support work
              together. Enter your latest scores, compete for prize pools, and channel part of every subscription to a
              cause you choose.
            </motion.p>

            <motion.div variants={riseIn} className="flex flex-wrap gap-3">
              <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/signup"
                  className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_14px_34px_-15px_rgba(15,23,42,0.9)] transition hover:translate-y-[-1px] hover:bg-slate-700"
                >
                  Start your subscription
                </Link>
              </motion.div>
              <motion.a
                href="#how-it-works"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                See how it works
              </motion.a>
            </motion.div>

            <motion.div variants={riseIn} className="grid gap-3 sm:grid-cols-3">
              <motion.article whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur">
                <p className="font-mono text-xs uppercase tracking-wide text-slate-500">Score window</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">5</p>
                <p className="text-xs text-slate-600">Latest Stableford scores retained</p>
              </motion.article>
              <motion.article whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur">
                <p className="font-mono text-xs uppercase tracking-wide text-slate-500">Prize split</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">40/35/25</p>
                <p className="text-xs text-slate-600">Tiered draw distribution model</p>
              </motion.article>
              <motion.article whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur">
                <p className="font-mono text-xs uppercase tracking-wide text-slate-500">Charity floor</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">10%</p>
                <p className="text-xs text-slate-600">Minimum contribution from subscription</p>
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
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">01 Subscribe</p>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">Choose monthly or yearly plan</h3>
            <p className="mt-2 text-sm text-slate-600">Activate your account and set your charity contribution percentage.</p>
          </motion.article>
          <motion.article variants={riseIn} whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">02 Enter scores</p>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">Submit your latest Stableford rounds</h3>
            <p className="mt-2 text-sm text-slate-600">The platform automatically keeps your latest five scores, newest first.</p>
          </motion.article>
          <motion.article variants={riseIn} whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">03 Win and verify</p>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">Monthly draws and payout workflow</h3>
            <p className="mt-2 text-sm text-slate-600">If you win, upload score proof and track status from pending to paid.</p>
          </motion.article>
        </motion.section>
      </section>
    </main>
  )
}
