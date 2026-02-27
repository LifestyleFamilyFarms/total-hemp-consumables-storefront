"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { cn } from "@lib/utils"
import {
  PlpCardStyle,
  PLP_CARD_STYLES,
  PLP_CARD_STYLE_LABELS,
} from "@modules/store/lib/card-style"
import { PLP_QUERY_KEYS } from "@modules/store/lib/url-state"

type PlpCardStyleSwitcherProps = {
  value: PlpCardStyle
}

export default function PlpCardStyleSwitcher({ value }: PlpCardStyleSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const onStyleSelect = (nextStyle: PlpCardStyle) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(PLP_QUERY_KEYS.cardStyle, nextStyle)
    params.delete(PLP_QUERY_KEYS.page)
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <section className="surface-panel rounded-3xl border border-border/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
            Card style
          </p>
          <p className="text-xs text-foreground/72">
            Switch visual direction and compare cards in real data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PLP_CARD_STYLES.map((style) => {
            const isActive = style === value
            return (
              <button
                key={style}
                type="button"
                onClick={() => onStyleSelect(style)}
                className={cn(
                  "inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-xs font-semibold transition",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "surface-button border-border/60 text-foreground/85 hover:border-primary/50"
                )}
              >
                {PLP_CARD_STYLE_LABELS[style]}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
