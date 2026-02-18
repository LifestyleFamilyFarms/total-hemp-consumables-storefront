import type { LucideIcon } from "lucide-react"
import { CircleUserRound, Home, Sparkles, Store } from "lucide-react"

export type NavItem = {
  label: string
  href: (countryCode: string) => string
  icon?: LucideIcon
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: (countryCode) => `/${countryCode}`, icon: Home },
  { label: "Shop", href: (countryCode) => `/${countryCode}/store`, icon: Store },
  {
    label: "Gamma Gummies",
    href: (countryCode) => `/${countryCode}/gamma-gummies`,
    icon: Sparkles,
  },
]

export const ACCOUNT_NAV_ITEMS: NavItem[] = [
  { label: "Account", href: (countryCode) => `/${countryCode}/account`, icon: CircleUserRound },
  {
    label: "Orders",
    href: (countryCode) => `/${countryCode}/account/orders`,
  },
  {
    label: "Addresses",
    href: (countryCode) => `/${countryCode}/account/addresses`,
  },
]
