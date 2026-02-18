"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { NAV_ITEMS } from "./nav-data"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@lib/utils"
import type { NavigationCategory } from "@lib/data/categories"
import {
  selectCloseNav,
  selectIsNavOpen,
  selectSetNavOpen,
  useStorefrontState,
} from "@lib/state"

export function MobileNav({
  countryCode,
  categories = [],
  triggerClassName,
}: {
  countryCode: string
  categories?: NavigationCategory[]
  triggerClassName?: string
}) {
  const isOpen = useStorefrontState(selectIsNavOpen)
  const setNavOpen = useStorefrontState(selectSetNavOpen)
  const closeNav = useStorefrontState(selectCloseNav)
  const items = NAV_ITEMS

  return (
    <Sheet open={isOpen} onOpenChange={setNavOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("md:hidden", triggerClassName)}
          aria-label="Open menu"
        >
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
                      <Link href={child.href(countryCode)} onClick={closeNav}>
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
                  <Link href={item.href(countryCode)} onClick={closeNav}>
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

          {categories.length > 0 && (
            <div className="grid gap-1 border-t border-border/60 pt-4">
              <div className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Categories
              </div>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  asChild
                  className="justify-start"
                >
                  <Link
                    href={`/${countryCode}/categories/${category.handle}`}
                    onClick={closeNav}
                  >
                    {category.name}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
