import type { LucideIcon } from "lucide-react"
import {
  CircleUserRound,
  Home,
  ShoppingBag,
  WalletCards,
} from "lucide-react"


  export type NavChild = {
    label: string
    href: (cc: string) => string
  }
  
  export type NavItem = {
    label: string
    href?: (cc: string) => string
    icon?: LucideIcon
    children?: NavChild[]
  }

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: (cc) => `/${cc}`, icon: Home },
  { label: "Store", href: (cc) => `/${cc}/store`, icon: ShoppingBag },
  { label: "Checkout", href: (cc) => `/${cc}/checkout`, icon: WalletCards },
  { label: "Account", href: (cc) => `/${cc}/account`, icon: CircleUserRound },
]
