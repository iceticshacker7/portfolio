interface SectionItemProps {
  title: string
  description: string
  institution: string
  dateRange: string
}

/** One entry on the experience timeline: a dot on the rail plus a card. */
export default function SectionItem({ title, description, institution, dateRange }: SectionItemProps) {
  return (
    <div className="relative">
      <span className="absolute -left-[41px] top-5 h-4 w-4 rounded-full border-4 border-background bg-blue-600 dark:bg-blue-500" aria-hidden="true" />
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
          <h3 className="text-base sm:text-lg font-semibold text-foreground leading-snug">{title}</h3>
          {dateRange && <span className="shrink-0 text-xs font-medium text-muted-foreground sm:pt-1">{dateRange}</span>}
        </div>
        {institution && <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">{institution}</p>}
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}
