import type { LucideIcon } from "lucide-react"
import { CircleUserRound, Gift, Store, TreePine } from "lucide-react"

export type NavItem = {
  label: string
  href: (countryCode: string) => string
  icon?: LucideIcon
}

/* Primary nav: Shop + Our Farm — categories are injected dynamically from the backend */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: "Shop", href: (countryCode) => `/${countryCode}/store`, icon: Store },
]

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  {
    label: "Our Farm",
    href: (countryCode) => `/${countryCode}/content/about`,
    icon: TreePine,
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
  {
    label: "Loyalty & Rewards",
    href: (countryCode) => `/${countryCode}/account/loyalty`,
    icon: Gift,
  },
]
