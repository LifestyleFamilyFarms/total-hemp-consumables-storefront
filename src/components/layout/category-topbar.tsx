"use client"

import Link from "next/link"
import { STORE_CATEGORIES } from "@lib/constants/navigation"

type CategoryTopbarProps = {
  countryCode: string
}

export default function CategoryTopbar({ countryCode }: CategoryTopbarProps) {
  return (
    <div className="sticky top-16 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 overflow-x-auto px-4 py-3 sm:px-6">
        <span className="hidden text-xs font-semibold uppercase tracking-[0.25em] text-foreground/60 sm:inline-flex">
          Shop
        </span>
        <div className="flex flex-nowrap items-center gap-3 text-sm font-semibold text-foreground/80">
          {STORE_CATEGORIES.map((category) => (
            <Link
              key={category.title}
              href={`/${countryCode}/${category.slug}`}
              className="rounded-full border border-transparent px-3 py-1 transition hover:border-border/60 hover:bg-background"
            >
              {category.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
