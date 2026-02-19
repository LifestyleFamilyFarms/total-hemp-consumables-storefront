"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { DEFAULT_SORT, SORT_LABELS, SortOptions } from "@modules/store/lib/sort-options"
import { PLP_QUERY_KEYS } from "@modules/store/lib/url-state"

type Props = {
  /** current sort value (from server/search params). Defaults to "created_at". */
  value?: SortOptions
  className?: string
}

const OPTIONS = [
  { value: "created_at", label: SORT_LABELS.created_at },
  { value: "price_desc", label: SORT_LABELS.price_desc },
  { value: "price_asc", label: SORT_LABELS.price_asc },
  { value: "title_az", label: SORT_LABELS.title_az },
  { value: "title_za", label: SORT_LABELS.title_za },
] as const

export default function SortBar({ value, className }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const onChange = (next: SortOptions) => {
    const params = new URLSearchParams(searchParams?.toString())
    if (next) params.set(PLP_QUERY_KEYS.sort, next)
    else params.delete(PLP_QUERY_KEYS.sort)
    params.delete(PLP_QUERY_KEYS.legacySort)
    // reset pagination when sort changes
    params.delete(PLP_QUERY_KEYS.page)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className={className}>
      <Select onValueChange={(next) => onChange(next as SortOptions)} value={value ?? DEFAULT_SORT}>
        <SelectTrigger className="w-[220px]" aria-label="Sort products">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent align="end">
          {OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
