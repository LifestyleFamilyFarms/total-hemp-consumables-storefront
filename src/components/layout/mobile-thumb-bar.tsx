"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@lib/utils"
import { NAV_ITEMS } from "@/components/layout/nav-data"
import { useIsMobile } from "@/hooks/use-mobile"

export default function MobileThumbBar({ countryCode }: { countryCode: string }) {
  const pathname = usePathname()
  const { openMobile, toggleSidebar } = useSidebar()
  const isMobile = useIsMobile()
  const [isLandscape, setIsLandscape] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia("(orientation: landscape)")
    const update = () => setIsLandscape(mql.matches)
    update()

    if ("addEventListener" in mql) {
      mql.addEventListener("change", update)
      return () => mql.removeEventListener("change", update)
    }

    mql.addListener(update)
    return () => mql.removeListener(update)
  }, [])

  if (!isMobile) return null

  if (isLandscape) {
    return (
      <div
        className={cn(
          "pointer-events-none fixed z-50",
          openMobile && "hidden"
        )}
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px))",
          right: "calc(env(safe-area-inset-right, 0px))",
        }}
      >
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={openMobile ? "Close menu" : "Open menu"}
          aria-expanded={openMobile}
          className="pointer-events-auto relative flex h-16 min-w-[7rem] flex-col items-center justify-center gap-1 rounded-tl-[28px] border border-white/12 bg-gradient-to-br from-background/50 via-background/26 to-background/68 px-6 text-sm font-semibold text-foreground shadow-[0_24px_52px_rgba(15,23,42,0.34),0_8px_20px_rgba(15,23,42,0.26)] backdrop-blur-2xl transition-transform rounded-tr-none rounded-br-none rounded-bl-none active:scale-95"
        >
          <Menu className="h-5 w-5" />
          <span className="leading-none">Menu</span>
        </button>
      </div>
    )
  }

  const quickOrder = ["Flower", "Vapes", "Edibles", "Gamma Gummies"] as const
  const quickItems = quickOrder
    .map((label) => NAV_ITEMS.find((it) => it.label === label && it.icon))
    .filter(Boolean)
    .map((item) => {
      // type guard
      const it = item as typeof NAV_ITEMS[number]
      const href = item.href ? item.href(countryCode) : `/${countryCode}`
      const isRootUrl = href === `/${countryCode}` || href === `/${countryCode}/`
      const active = item.href
        ? isRootUrl
          ? it.label === "Home" && pathname === `/${countryCode}`
          : pathname === href || pathname.startsWith(href + "/")
        : false

      const ariaLabel = it.label === "Gamma Gummies" ? "Gamma Gummies limited drop" : it.label

      return {
        key: it.label.toLowerCase().replace(/\s+/g, "-"),
        label: it.label,
        href,
        Icon: it.icon!,
        active,
        ariaLabel,
      }
    })

  return (
    <nav
      role="navigation"
      aria-label="Quick navigation"
      className={cn(
        "fixed bottom-8 inset-x-0 z-50 border-t bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        openMobile && "hidden"
      )}
    >
      <ul className="grid grid-cols-5 items-center gap-1 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {quickItems.map(({ key, label, href, Icon, active, ariaLabel }) => (
          <li key={key} className="flex justify-center">
            <Link
              href={href}
              aria-label={ariaLabel}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-md px-2 py-1.5 text-xs transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-muted/60"
              )}
            >
              {label === "Gamma Gummies" ? (
                <span className="absolute -top-1 right-1 inline-flex items-center rounded-full bg-primary px-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                  New
                </span>
              ) : null}
              <Icon className="h-5 w-5" />
              <span className="leading-none">{label}</span>
            </Link>
          </li>
        ))}
        <li className="flex justify-center">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={openMobile ? "Close menu" : "Open menu"}
            className="flex flex-col items-center gap-1 rounded-md px-2 py-1.5 text-xs"
          >
            <Menu className="h-5 w-5" />
            <span className="leading-none">Menu</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
