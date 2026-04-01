import type { ReactNode } from "react"

type SectionCardProps = {
  id?: string
  title: string
  description?: string
  children: ReactNode
}

export function SectionCard({ id, title, description, children }: SectionCardProps) {
  return (
    <section id={id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}
