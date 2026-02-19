"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@lib/utils"
import { PLP_QUERY_KEYS } from "@modules/store/lib/url-state"

export function Pagination({
  page,
  totalPages,
  "data-testid": dataTestid,
}: {
  page: number
  totalPages: number
  "data-testid"?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) {
    return null
  }

  const pushPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString())

    if (nextPage <= 1) {
      params.delete(PLP_QUERY_KEYS.page)
    } else {
      params.set(PLP_QUERY_KEYS.page, nextPage.toString())
    }

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const pages = getVisiblePages(page, totalPages)

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Product pagination"
      data-testid={dataTestid}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => pushPage(page - 1)}
        disabled={page <= 1}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>

      {pages.map((item, index) => {
        if (item === "ellipsis") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-foreground/60"
            >
              ...
            </span>
          )
        }

        const isActive = item === page

        return (
          <button
            key={item}
            type="button"
            onClick={() => pushPage(item)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/60 bg-background/80 text-foreground hover:border-primary/50"
            )}
          >
            {item}
          </button>
        )
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => pushPage(page + 1)}
        disabled={page >= totalPages}
        className="gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}

function getVisiblePages(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, "ellipsis", total]
  }

  if (current >= total - 2) {
    return [1, "ellipsis", total - 3, total - 2, total - 1, total]
  }

  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total]
}
