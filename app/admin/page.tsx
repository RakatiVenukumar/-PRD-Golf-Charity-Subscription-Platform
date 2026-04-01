export default function AdminPage() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Users</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">--</p>
        <p className="mt-1 text-sm text-slate-600">User management module arrives in Step 17.</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Charities</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">--</p>
        <p className="mt-1 text-sm text-slate-600">Charity CRUD module arrives in Step 18.</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Draws</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">--</p>
        <p className="mt-1 text-sm text-slate-600">Draw execution module arrives in Step 22.</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Winners</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">--</p>
        <p className="mt-1 text-sm text-slate-600">Verification module arrives in Step 25.</p>
      </article>
    </section>
  )
}
