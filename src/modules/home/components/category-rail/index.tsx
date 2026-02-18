import Link from "next/link"
import { ArrowUpRight, Sparkles } from "lucide-react"
import type { NavigationCategory } from "@lib/data/categories"

type CategoryRailProps = {
  countryCode: string
  categories: NavigationCategory[]
  compact?: boolean
}

export default function CategoryRail({
  countryCode,
  categories,
  compact = false,
}: CategoryRailProps) {
  if (categories.length === 0) {
    return null
  }

  if (compact) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/60">Shop categories</p>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/${countryCode}/categories/${category.handle}`}
            className="group flex w-full items-start justify-between gap-3 rounded-2xl border border-border/40 bg-background/85 px-4 py-4 text-left"
          >
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">{category.name}</p>
              <p className="text-xs text-foreground/60">Browse the latest {category.name.toLowerCase()} products.</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-foreground/60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </Link>
        ))}
      </div>
    )
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/60">Shop categories</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Browse by format without the overwhelm.
          </h2>
          <p className="text-sm text-foreground/70 sm:max-w-2xl">
            Each lane surfaces its own editorial cards, quick-add bundles, and compliance notes so you can jump straight
            to what matters.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/60">
          <Sparkles className="h-4 w-4 text-primary" /> Pin your favorites for next visit
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/${countryCode}/categories/${category.handle}`}
            className="group relative flex h-full flex-col justify-between rounded-[30px] border border-border/50 bg-background/90 p-5 shadow-[0_24px_50px_rgba(15,23,42,0.18)] backdrop-blur supports-[backdrop-filter]:bg-background/45 transition hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.1),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative space-y-3">
              <p className="text-lg font-semibold text-foreground">{category.name}</p>
              <p className="text-sm text-foreground/70">
                Fresh, live-inventory picks from the {category.name.toLowerCase()} category.
              </p>
            </div>
            <div className="relative mt-4 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-foreground/50">
              <span>Live catalog</span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-foreground/70 transition group-hover:border-primary group-hover:text-primary">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
