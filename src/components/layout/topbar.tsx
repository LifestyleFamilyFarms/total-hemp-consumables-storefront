"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTransition } from "react"
import { ChevronDown, Menu, UserRound } from "lucide-react"

import { HttpTypes } from "@medusajs/types"

import { BrandLogo } from "@/components/brand/brand-logo"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ACCOUNT_NAV_ITEMS, PRIMARY_NAV_ITEMS } from "@/components/layout/nav-data"
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

const mobileMarkForTheme: Record<BrandThemeId, BrandLogoVariant> = {
  sativa: "navMonogram",
  indica: "navMonogramDb",
  light: "monoIcon",
  dark: "navMonogramBw",
}

export default function Topbar({
  countryCode,
  cart = null,
  categories = [],
  user,
}: TopbarProps) {
  const [signingOut, startSignout] = useTransition()
  const pathname = usePathname()
  const normalizedPath = normalizePath(pathname)
  const categoryBasePath = normalizePath(`/${countryCode}/categories`)
  const isCategoryRoute =
    normalizedPath === categoryBasePath ||
    normalizedPath.startsWith(`${categoryBasePath}/`)

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

  return (
    <header className="surface-nav sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto w-full max-w-8xl px-4 sm:px-6">
        <div className="relative flex h-16 items-center gap-2">
          <div className="flex items-center gap-2 lg:hidden">
            <MobileNav
              countryCode={countryCode}
              categories={categories}
              isAuthenticated={Boolean(user?.isAuthenticated)}
              triggerAriaLabel="Open navigation menu"
              triggerClassName="surface-button h-9 gap-2 rounded-full px-2.5 text-foreground/85 transition-colors hover:border-foreground/40 hover:text-foreground md:h-10 md:px-3"
              triggerContent={
                <>
                  <BrandLogo variant={mobileMarkForTheme[currentTheme]} className="w-6 md:w-7" />
                  <Menu className="h-4 w-4" />
                </>
              }
            />
          </div>

          <Link
            href={`/${countryCode}`}
            aria-label="Return to the homepage"
            className="hidden w-52 items-center lg:flex"
          >
            <span className="sr-only">Total Hemp Consumables</span>
            <BrandLogo
              theme={currentTheme}
              slot={desktopLogoSlot}
              className="w-full"
            />
          </Link>

          <Link
            href={`/${countryCode}`}
            aria-label="Return to the homepage"
            className="absolute left-1/2 hidden w-44 -translate-x-1/2 items-center md:flex lg:hidden"
          >
            <span className="sr-only">Total Hemp Consumables</span>
            <BrandLogo theme={currentTheme} slot={desktopLogoSlot} className="w-full" />
          </Link>

          <nav className="ml-2 hidden items-center gap-4 lg:flex" aria-label="Primary">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const href = item.href(countryCode)
              const isActive =
                normalizedPath === normalizePath(href) ||
                normalizedPath.startsWith(`${normalizePath(href)}/`)

              return (
                <Link
                  key={item.label}
                  href={href}
                  className={[
                    "text-cast-shadow text-sm font-semibold transition-colors",
                    isActive ? "text-foreground" : "text-foreground/70 hover:text-foreground",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              )
            })}

            {categories.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={[
                      "surface-button inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-cast-shadow text-sm font-semibold transition-colors",
                      isCategoryRoute
                        ? "text-foreground"
                        : "text-foreground/70 hover:text-foreground",
                    ].join(" ")}
                    aria-label="Browse categories"
                  >
                    Categories
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Browse Categories</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {categories.map((category) => (
                    <DropdownMenuItem key={category.id} asChild>
                      <Link href={`/${countryCode}/categories/${category.handle}`}>
                        {category.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${countryCode}/store`}>View all products</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <ThemeSwitcher compact className="surface-button h-9 w-9 md:h-10 md:w-10" />

            <CartDrawer
              countryCode={countryCode}
              cart={cart}
              isAuthenticated={Boolean(user?.isAuthenticated)}
              compactOnMobile
              className="surface-button inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground/40 md:h-10 lg:gap-2 lg:px-3 lg:py-2"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {user?.isAuthenticated ? (
                  <Button
                    variant="outline"
                    className="surface-button hidden h-10 items-center gap-2 rounded-full px-2 transition-colors hover:border-foreground/40 md:inline-flex"
                  >
                    <Avatar className="h-7 w-7 rounded-full">
                      <AvatarImage src={user?.avatarUrl ?? ""} alt={name} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-semibold sm:inline-flex">{name}</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="surface-button hidden h-10 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/85 transition-colors hover:border-foreground/40 md:inline-flex"
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
                      <Link href={`/${countryCode}/account`}>Sign in</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/${countryCode}/account`}>Create account</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

      </div>
    </header>
  )
}
