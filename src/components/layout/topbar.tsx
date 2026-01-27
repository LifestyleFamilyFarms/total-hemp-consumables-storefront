"use client"

import Link from "next/link"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Menu, ShoppingCart } from "lucide-react"
import { useTheme } from "@/components/theme/theme-provider"
import { ThemeSwitcher } from "@/components/theme/theme-switcher"
import type { BrandThemeId } from "@lib/brand"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type TopbarProps = {
  countryCode: string
  user?: {
    isAuthenticated?: boolean | null
    name?: string | null
    email?: string | null
    avatarUrl?: string | null
  } | null
}

export default function Topbar({ countryCode, user }: TopbarProps) {
  const { toggleSidebar } = useSidebar()
  const accountHref = `/${countryCode}/account`
  const { theme } = useTheme()
  const currentTheme = theme as BrandThemeId
  const desktopLogoSlot = currentTheme === "indica" ? "nav" : "hero"
  const name = user?.name ?? "Guest"
  const initials = (name || "TH")
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/85/80 backdrop-blur-lg">
      <div className="relative flex h-16 w-full items-center px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={toggleSidebar}
            variant="outline"
            size="icon"
            aria-label="Open menu"
            className="h-11 w-11 rounded-xl border border-white/15 bg-background/70 text-foreground/80 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-colors hover:border-foreground/40 hover:text-foreground sm:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <ThemeSwitcher className="h-10" />
        </div>

        <Link
          href={`/${countryCode}`}
          aria-label="Return to the homepage"
          className="absolute left-1/2 flex w-32 -translate-x-1/2 items-center justify-center sm:w-48 lg:w-56"
        >
          <span className="sr-only">Total Hemp Consumables</span>
          <BrandLogo theme={currentTheme} slot="nav" className="block w-10 sm:hidden" />
          <BrandLogo
            theme={currentTheme}
            slot={desktopLogoSlot}
            className="hidden w-full sm:block"
          />
        </Link>

        {/* Right Side of Topbar */}
        <div className="ml-auto flex items-center gap-3">
          <Link
            href={`/${countryCode}/cart`}
            className="hidden items-center gap-2 rounded-full border border-white/15 bg-background/70 px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition hover:border-foreground/40 sm:inline-flex"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="hidden h-11 items-center gap-2 rounded-full border border-white/15 bg-background/70 px-3 text-sm font-semibold text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition hover:border-white/25 sm:inline-flex"
              >
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={user?.avatarUrl ?? ""} alt={name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline-flex">{name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="text-foreground">{name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user?.isAuthenticated ? (
                <>
                  <DropdownMenuItem asChild><Link href={accountHref}>Account</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href={`/${countryCode}/account/orders`}>Orders</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href={`/${countryCode}/account/addresses`}>Addresses</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href={`/${countryCode}/logout`}>Sign out</Link></DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild><Link href={`/${countryCode}/login`}>Sign in</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href={`/${countryCode}/register`}>Create account</Link></DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
