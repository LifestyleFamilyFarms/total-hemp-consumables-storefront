"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { NAV_ITEMS } from "./nav-data"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export function MobileNav({ countryCode }: { countryCode: string }) {
  const [open, setOpen] = useState(false)
  const items = NAV_ITEMS

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-80">
        {/* Accessible name for screen readers */}
        <SheetHeader className="sr-only">
          <SheetTitle>Main navigation</SheetTitle>
        </SheetHeader>

        <nav className="grid gap-3 pt-4">
          {items.map((item) => {
            if (item.children && item.children.length > 0) {
              return (
                <div key={item.label} className="grid gap-1">
                  <div className="px-1 text-xs font-semibold uppercase text-foreground/60">
                    {item.label}
                  </div>
                  {item.children.map((child) => (
                    <Button
                      key={`${item.label}-${child.label}`}
                      variant="ghost"
                      asChild
                      className="justify-start"
                    >
                      <Link href={child.href(countryCode)} onClick={() => setOpen(false)}>
                        {child.label}
                      </Link>
                    </Button>
                  ))}
                </div>
              )
            }

            if (item.href) {
              return (
                <Button key={item.label} variant="ghost" asChild className="justify-start">
                  <Link href={item.href(countryCode)} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                </Button>
              )
            }

            return (
              <div key={item.label} className="px-2 py-2 text-sm text-foreground/60">
                {item.label}
              </div>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}