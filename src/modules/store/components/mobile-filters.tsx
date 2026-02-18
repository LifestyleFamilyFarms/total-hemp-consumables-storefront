"use client"

import { useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import RefinementList from "@modules/store/components/refinement-list"

export default function MobileFilters({ sortBy }: { sortBy?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 md:hidden" aria-label="Filters">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[90vw] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Refine products by category, sorting, and availability options.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          {/* Your existing refinement UI – unchanged */}
          <RefinementList sortBy={(sortBy as any) ?? "created_at"} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
