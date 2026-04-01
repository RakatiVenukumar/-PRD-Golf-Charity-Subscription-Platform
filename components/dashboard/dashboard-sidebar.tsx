import Link from "next/link"

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Scores", href: "/dashboard#scores" },
  { label: "Charity", href: "/dashboard#charity" },
  { label: "Winnings", href: "/dashboard#winnings" },
]

type DashboardSidebarProps = {
  userEmail: string
}

export function DashboardSidebar({ userEmail }: DashboardSidebarProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:h-fit">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subscriber panel</p>
      <p className="mt-2 truncate text-sm font-medium text-slate-700">{userEmail}</p>

      <nav className="mt-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:bg-slate-50"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
