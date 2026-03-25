"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRef, useState, useTransition } from "react"
import { ChevronDown, Menu, UserRound } from "lucide-react"
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "motion/react"

import { HttpTypes } from "@medusajs/types"

import { BrandLogo } from "@/components/brand/brand-logo"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ACCOUNT_NAV_ITEMS, PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/components/layout/nav-data"
import { ThemeSwitcher } from "@/components/theme/theme-switcher"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signout } from "@lib/data/customer"
import type { NavigationCategory } from "@lib/data/categories"
import type { BrandLogoVariant, BrandThemeId } from "@lib/brand"
import { useTheme } from "@/components/theme/theme-provider"
import CartDrawer from "@modules/cart/components/cart-drawer"

type TopbarProps = {
  countryCode: string
  cart?: HttpTypes.StoreCart | null
  categories?: NavigationCategory[]
  user?: {
    isAuthenticated?: boolean | null
    name?: string | null
    email?: string | null
    avatarUrl?: string | null
  } | null
}

const normalizePath = (path: string) => {
  if (!path) return "/"
  if (path === "/") return "/"
  return path.replace(/\/+$/, "")
}

const menuBadgeVariantByTheme: Record<BrandThemeId, BrandLogoVariant> = {
  indica: "navMonogramDb",
  daylight: "navMonogram",
  midnight: "navMonogramBw",
}

/* ── Group categories by prefix (THC, CBD, CBG, etc.) ── */
function groupCategoriesByType(categories: NavigationCategory[]) {
  const groups: Record<string, { label: string; handle: string }[]> = {}

  for (const cat of categories) {
    /* Match prefixes like "THC", "CBD", "CBG" at the start of the name */
    const match = cat.name.match(/^(THC|CBD|CBG|CBN|Delta[\s-]?\d+)/i)
    const prefix = match ? match[1].toUpperCase().replace(/[\s-]/g, "") : "Other"

    if (!groups[prefix]) groups[prefix] = []
    /* Strip the prefix from the display name for the dropdown */
    const shortName = match
      ? cat.name.slice(match[0].length).replace(/^\s+/, "") || cat.name
      : cat.name
    groups[prefix].push({ label: shortName, handle: cat.handle })
  }

  return groups
}

/* ── Nav links with shared hover indicator + category dropdowns ── */
function NavLinks({
  countryCode,
  categories,
  normalizedPath,
}: {
  countryCode: string
  categories: NavigationCategory[]
  normalizedPath: string
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const categoryGroups = groupCategoriesByType(categories)
  const categoryBasePath = normalizePath(`/${countryCode}/categories`)

  /* Build nav items: Shop → THC → CBD → ... → Our Farm */
  type NavEntry =
    | { type: "link"; id: string; label: string; href: string }
    | { type: "group"; id: string; label: string; items: { label: string; href: string }[] }

  const entries: NavEntry[] = [
    ...PRIMARY_NAV_ITEMS.map((item) => ({
      type: "link" as const,
      id: item.label,
      label: item.label,
      href: item.href(countryCode),
    })),
    ...Object.entries(categoryGroups).map(([prefix, items]) => ({
      type: "group" as const,
      id: prefix,
      label: prefix,
      items: items.map((item) => ({
        label: item.label,
        href: `/${countryCode}/categories/${item.handle}`,
      })),
    })),
    ...SECONDARY_NAV_ITEMS.map((item) => ({
      type: "link" as const,
      id: item.label,
      label: item.label,
      href: item.href(countryCode),
    })),
  ]

  return (
    <nav
      className="ml-4 hidden flex-1 items-center justify-center gap-4 lg:gap-6 xl:gap-8 lg:flex [@media(min-width:1024px)_and_(max-height:800px)]:hidden"
      onMouseLeave={() => setHovered(null)}
      aria-label="Primary"
    >
      {entries.map((entry) => {
        if (entry.type === "link") {
          const normalizedHref = normalizePath(entry.href)
          const isActive =
            normalizedPath === normalizedHref ||
            normalizedPath.startsWith(`${normalizedHref}/`)

          return (
            <Link
              key={entry.id}
              href={entry.href}
              onMouseEnter={() => setHovered(entry.id)}
              className={[
                "relative px-4 py-2 text-sm font-semibold transition-colors duration-200",
                isActive ? "text-accent" : "text-white/70 hover:text-white",
              ].join(" ")}
            >
              {hovered === entry.id && (
                <motion.div
                  layoutId="nav-hover"
                  className="absolute inset-0 rounded-lg bg-white/[0.08]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{entry.label}</span>
            </Link>
          )
        }

        /* Category group with hover dropdown */
        const isGroupActive = entry.items.some((item) => {
          const nh = normalizePath(item.href)
          return normalizedPath === nh || normalizedPath.startsWith(`${nh}/`)
        })

        return (
          <div
            key={entry.id}
            className="relative"
            onMouseEnter={() => setHovered(entry.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <button
              type="button"
              className={[
                "relative flex items-center gap-1 px-4 py-2 text-sm font-semibold transition-colors duration-200",
                isGroupActive ? "text-accent" : "text-white/70 hover:text-white",
              ].join(" ")}
            >
              {hovered === entry.id && (
                <motion.div
                  layoutId="nav-hover"
                  className="absolute inset-0 rounded-lg bg-white/[0.08]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{entry.label}</span>
              <ChevronDown className={[
                "relative z-10 h-3 w-3 transition-transform duration-200",
                hovered === entry.id ? "rotate-180" : "",
              ].join(" ")} />
            </button>

            <AnimatePresence>
              {hovered === entry.id && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute left-0 top-full pt-2"
                >
                  <div className="min-w-[180px] overflow-hidden rounded-xl border border-white/[0.08] bg-black/60 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md">
                    {entry.items.map((item) => {
                      const nh = normalizePath(item.href)
                      const isItemActive =
                        normalizedPath === nh || normalizedPath.startsWith(`${nh}/`)

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={[
                            "block rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-150",
                            isItemActive
                              ? "bg-white/[0.08] text-accent"
                              : "text-white/70 hover:bg-white/[0.06] hover:text-white",
                          ].join(" ")}
                        >
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </nav>
  )
}

export default function Topbar({
  countryCode,
  cart = null,
  categories = [],
  user,
}: TopbarProps) {
  const [signingOut, startSignout] = useTransition()
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const normalizedPath = normalizePath(pathname)
  const { theme } = useTheme()
  const currentTheme = theme as BrandThemeId
  const desktopLogoSlot = currentTheme === "indica" ? "nav" : "hero"
  const name = user?.name ?? "Account"
  const initials = (name || "TH")
    .split(" ")
    .map((segment: string) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const ref = useRef<HTMLElement>(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 80)
  })

  return (
    <header ref={ref} className="sticky top-0 z-40 w-full">
      <motion.div
        animate={{
          paddingLeft: scrolled ? 16 : 12,
          paddingRight: scrolled ? 16 : 12,
          paddingTop: scrolled ? 6 : 10,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="mx-auto w-full max-w-8xl"
      >
        <motion.div
          animate={{
            backgroundColor: scrolled
              ? "rgba(0, 0, 0, 0.55)"
              : "rgba(0, 0, 0, 0.30)",
            backdropFilter: scrolled ? "blur(12px)" : "blur(4px)",
            borderRadius: scrolled ? 16 : 20,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
          className="border border-white/[0.08] px-4 shadow-[0_4px_24px_rgba(0,0,0,0.2)] sm:px-6"
        >
          <div className="relative flex h-14 items-center gap-2 sm:h-16">
            {/* Mobile: hamburger + theme */}
            <div className="flex items-center gap-1.5 lg:hidden [@media(min-width:1024px)_and_(max-height:800px)]:flex">
              <MobileNav
                countryCode={countryCode}
                categories={categories}
                isAuthenticated={Boolean(user?.isAuthenticated)}
                triggerAriaLabel="Open navigation menu"
                triggerClassName="h-9 gap-2 rounded-xl px-2.5 text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white md:h-10 md:px-3"
                triggerContent={
                  <>
                    <BrandLogo
                      variant={menuBadgeVariantByTheme[currentTheme]}
                      size="sm"
                      format="svg"
                      className="w-5 md:w-[22px]"
                    />
                    <Menu className="h-4 w-4 md:h-5 md:w-5" />
                  </>
                }
              />
              <ThemeSwitcher compact className="hidden h-9 w-9 rounded-xl text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white md:inline-flex lg:hidden [@media(min-width:1024px)_and_(max-height:800px)]:inline-flex" />
            </div>

            {/* Desktop: logo left */}
            <Link
              href={`/${countryCode}`}
              aria-label="Return to the homepage"
              className="hidden w-44 items-center lg:flex [@media(min-width:1024px)_and_(max-height:800px)]:hidden"
            >
              <span className="sr-only">Total Hemp Consumables</span>
              <BrandLogo
                theme={currentTheme}
                slot={desktopLogoSlot}
                className="w-full"
              />
            </Link>

            {/* Tablet: logo centered */}
            <Link
              href={`/${countryCode}`}
              aria-label="Return to the homepage"
              className="absolute left-1/2 hidden w-44 -translate-x-1/2 items-center md:flex lg:hidden [@media(min-width:1024px)_and_(max-height:800px)]:flex"
            >
              <span className="sr-only">Total Hemp Consumables</span>
              <BrandLogo
                theme={currentTheme}
                slot={desktopLogoSlot}
                className="w-full"
              />
            </Link>

            {/* Desktop: nav links with sliding hover indicator */}
            <NavLinks
              countryCode={countryCode}
              categories={categories}
              normalizedPath={normalizedPath}
            />

            {/* Right: actions */}
            <div className="ml-auto flex items-center gap-2">
              <ThemeSwitcher compact className="h-9 w-9 rounded-xl text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white md:hidden md:h-10 md:w-10 lg:inline-flex [@media(min-width:1024px)_and_(max-height:800px)]:hidden" />

              <CartDrawer
                countryCode={countryCode}
                cart={cart}
                isAuthenticated={Boolean(user?.isAuthenticated)}
                compactOnMobile
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm font-semibold text-white/80 transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white md:h-10 lg:gap-2 lg:px-3.5"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {user?.isAuthenticated ? (
                    <Button
                      variant="outline"
                      className="hidden h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2.5 transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.08] md:inline-flex"
                    >
                      <Avatar className="h-7 w-7 rounded-full">
                        <AvatarImage src={user?.avatarUrl ?? ""} alt={name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <span className="hidden text-sm font-semibold text-white sm:inline-flex">{name}</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="hidden h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white md:inline-flex"
                      aria-label="Sign in or create account"
                    >
                      <UserRound className="h-4 w-4" />
                      <span>Sign In</span>
                    </Button>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="text-foreground">{name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.isAuthenticated ? (
                    <>
                      {ACCOUNT_NAV_ITEMS.map((item) => (
                        <DropdownMenuItem key={item.label} asChild>
                          <Link href={item.href(countryCode)}>{item.label}</Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={signingOut}
                        onSelect={(event) => {
                          event.preventDefault()
                          startSignout(async () => {
                            await signout(countryCode)
                          })
                        }}
                      >
                        {signingOut ? "Signing out..." : "Sign out"}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={`/${countryCode}/account?view=sign-in`}>Sign in</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/${countryCode}/account?view=register`}>Create account</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </header>
  )
}
