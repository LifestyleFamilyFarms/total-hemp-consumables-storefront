"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import type { ReactNode } from "react"

import { BrandLogo } from "@/components/brand/brand-logo"
import type { NavigationCategory } from "@lib/data/categories"
import { cn } from "@lib/utils"
import {
  selectCloseNav,
  selectIsNavOpen,
  selectSetNavOpen,
  useStorefrontState,
} from "@lib/state"
import { ACCOUNT_NAV_ITEMS, PRIMARY_NAV_ITEMS } from "@/components/layout/nav-data"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "@/components/theme/theme-provider"
import type { BrandThemeId } from "@lib/brand"

type MobileNavProps = {
  countryCode: string
  categories?: NavigationCategory[]
  isAuthenticated?: boolean
  triggerClassName?: string
  triggerContent?: ReactNode
  triggerAriaLabel?: string
}

export function MobileNav({
  countryCode,
  categories = [],
  isAuthenticated = false,
  triggerClassName,
  triggerContent,
  triggerAriaLabel = "Open menu",
}: MobileNavProps) {
  const isOpen = useStorefrontState(selectIsNavOpen)
  const setNavOpen = useStorefrontState(selectSetNavOpen)
  const closeNav = useStorefrontState(selectCloseNav)
  const { theme } = useTheme()
  const currentTheme = theme as BrandThemeId

  const primaryItems = PRIMARY_NAV_ITEMS
  const accountItems = ACCOUNT_NAV_ITEMS

  return (
    <Sheet open={isOpen} onOpenChange={setNavOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("lg:hidden", triggerClassName)}
          aria-label={triggerAriaLabel}
        >
          {triggerContent ?? <Menu className="h-5 w-5" />}
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="h-dvh w-screen overflow-y-auto border-border/60 p-0 sm:max-w-sm">
        <SheetHeader className="border-b border-border/50 px-4 py-4 text-left">
          <SheetTitle className="text-sm font-semibold text-foreground">
            <Link href={`/${countryCode}`} onClick={closeNav} className="inline-flex w-40">
              <BrandLogo theme={currentTheme} slot="hero" className="w-full" />
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Browse primary links, categories, and account shortcuts.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-full flex-col px-4 py-4 pb-8">
          <nav className="grid gap-1" aria-label="Primary">
            {primaryItems.map((item) => (
              <Button key={item.label} variant="ghost" asChild className="justify-start rounded-lg">
                <Link href={item.href(countryCode)} onClick={closeNav}>
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>

          <div className="mt-5 border-t border-border/60 pt-4">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/60">
              Categories
            </p>
            {categories.length > 0 ? (
              <Accordion type="multiple" className="mt-2">
                {categories.map((category) => (
                  <AccordionItem key={category.id} value={category.id} className="border-border/40">
                    {category.children?.length ? (
                      <>
                        <AccordionTrigger className="px-2 text-sm font-semibold">
                          {category.name}
                        </AccordionTrigger>
                        <AccordionContent className="space-y-1 pb-2 pl-2">
                          <Button variant="ghost" asChild className="w-full justify-start text-sm">
                            <Link
                              href={`/${countryCode}/categories/${category.handle}`}
                              onClick={closeNav}
                            >
                              All {category.name}
                            </Link>
                          </Button>
                          {category.children.map((child) => (
                            <Button key={child.id} variant="ghost" asChild className="w-full justify-start text-sm">
                              <Link
                                href={`/${countryCode}/categories/${child.handle}`}
                                onClick={closeNav}
                              >
                                {child.name}
                              </Link>
                            </Button>
                          ))}
                        </AccordionContent>
                      </>
                    ) : (
                      <div className="py-1">
                        <Button variant="ghost" asChild className="w-full justify-start text-sm">
                          <Link
                            href={`/${countryCode}/categories/${category.handle}`}
                            onClick={closeNav}
                          >
                            {category.name}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Button variant="ghost" asChild className="mt-2 w-full justify-start">
                <Link href={`/${countryCode}/store`} onClick={closeNav}>
                  Browse Store
                </Link>
              </Button>
            )}
          </div>

          <div className="mt-5 border-t border-border/60 pt-4">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/60">
              Account
            </p>
            <div className="mt-1 grid gap-1">
              {isAuthenticated ? (
                accountItems.map((item) => (
                  <Button key={item.label} variant="ghost" asChild className="justify-start rounded-lg">
                    <Link href={item.href(countryCode)} onClick={closeNav}>
                      {item.label}
                    </Link>
                  </Button>
                ))
              ) : (
                <>
                  <Button variant="ghost" asChild className="justify-start rounded-lg">
                    <Link href={`/${countryCode}/account`} onClick={closeNav}>
                      Sign In
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start rounded-lg">
                    <Link href={`/${countryCode}/account`} onClick={closeNav}>
                      Create Account
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
