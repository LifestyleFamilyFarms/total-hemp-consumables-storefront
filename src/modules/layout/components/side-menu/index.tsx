"use client"

import { Menu } from "lucide-react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"
import useToggleState from "@lib/hooks/use-toggle-state"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const SideMenuItems = [
  { name: "Home", href: "/" },
  { name: "Store", href: "/store" },
  { name: "Rewards", href: "/content/loyalty-rewards" },
  { name: "Account", href: "/account" },
  { name: "Cart", href: "/cart" },
]

const SideMenu = ({ regions }: { regions: HttpTypes.StoreRegion[] | null }) => {
  const toggleState = useToggleState()
  const year = new Date().getFullYear()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          data-testid="nav-menu-button"
          className="flex items-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-4 w-4" aria-hidden />
          Menu
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-full flex-col gap-6 border-border/70 bg-background/95 backdrop-blur sm:max-w-md"
      >
        <SheetHeader className="items-start text-left">
          <SheetTitle className="text-lg font-semibold text-foreground">
            Navigate
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Move around the storefront and switch your shipping region.
          </SheetDescription>
        </SheetHeader>

        <nav className="space-y-2">
          {SideMenuItems.map((item) => (
            <LocalizedClientLink
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-xl border border-transparent px-3 py-2 text-base font-semibold text-foreground/85 transition hover:border-border/60 hover:bg-card/80 hover:text-foreground"
              data-testid={`${item.name.toLowerCase()}-link`}
            >
              <span>{item.name}</span>
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                go
              </span>
            </LocalizedClientLink>
          ))}
        </nav>

        <div
          className="rounded-xl border border-border/70 bg-card/70 p-3 shadow-inner"
          onMouseEnter={toggleState.open}
          onMouseLeave={toggleState.close}
          onClick={toggleState.toggle}
        >
          {regions && (
            <CountrySelect toggleState={toggleState} regions={regions} />
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2 text-xs text-muted-foreground">
          <span className="flex items-center justify-between">
            <span>© {year} Total Hemp.</span>
            <span>Adults 21+ only.</span>
          </span>
          <span className="text-muted-foreground/80">
            Built with Medusa & Next.js.
          </span>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SideMenu
