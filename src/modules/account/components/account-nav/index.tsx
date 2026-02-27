"use client"

import {
  Award,
  ChevronRight,
  LogOut,
  MapPin,
  Package,
  UserRound,
} from "lucide-react"
import { useParams, usePathname } from "next/navigation"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { signout } from "@lib/data/customer"
import { cn } from "src/lib/utils"
import { Button } from "@/components/ui/button"

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const navItems = [
    { label: "Overview", href: "/account", icon: UserRound, testId: "overview-link" },
    { label: "Profile", href: "/account/profile", icon: UserRound, testId: "profile-link" },
    { label: "Addresses", href: "/account/addresses", icon: MapPin, testId: "addresses-link" },
    { label: "Orders", href: "/account/orders", icon: Package, testId: "orders-link" },
    { label: "Loyalty", href: "/account/loyalty", icon: Award, testId: "loyalty-link" },
  ]

  const handleLogout = async () => {
    await signout(countryCode)
  }

  const isActive = (href: string) => {
    if (!route) return false
    const target = `/${countryCode}${href}`
    return route === target || route.startsWith(`${target}/`)
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-[0_18px_42px_rgba(5,8,20,0.32)] backdrop-blur">
      <div className="flex items-center justify-between pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Account
          </span>
          <span className="text-lg font-semibold text-foreground">
            {customer?.first_name ?? "Guest"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="gap-2 text-sm text-muted-foreground hover:text-foreground"
          data-testid="logout-button"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Log out
        </Button>
      </div>

      <ul className="space-y-1" data-testid="account-nav">
        {navItems.map((item) => (
          <li key={item.href}>
            <AccountNavLink
              href={item.href}
              active={isActive(item.href)}
              data-testid={item.testId}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" aria-hidden />
                <span>{item.label}</span>
              </div>
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform duration-150",
                  isActive(item.href) && "translate-x-1"
                )}
                aria-hidden
              />
            </AccountNavLink>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-border/60 pt-3">
        <LocalizedClientLink
          href="/content/loyalty-rewards"
          className="text-sm font-medium text-primary hover:text-primary/80"
        >
          How loyalty rewards work
        </LocalizedClientLink>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  active: boolean
  children: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  active,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()

  return (
    <LocalizedClientLink
      href={href}
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground",
        active && "bg-accent/50 text-foreground shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
      )}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
