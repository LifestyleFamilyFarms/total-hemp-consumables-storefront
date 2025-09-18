"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  /** current sort value (from server/search params). Defaults to "created_at". */
  value?: string
  className?: string
}

// Keep these in sync with your backend sort handling
const OPTIONS = [
  { value: "created_at", label: "Newest" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "title_az", label: "Name: A → Z" },
  { value: "title_za", label: "Name: Z → A" },
]

export default function SortBar({ value, className }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const onChange = (next: string) => {
    const params = new URLSearchParams(searchParams?.toString())
    if (next) params.set("sortBy", next)
    else params.delete("sortBy")
    // reset pagination when sort changes
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className={className}>
      <Select onValueChange={onChange} value={value ?? "created_at"}>
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
