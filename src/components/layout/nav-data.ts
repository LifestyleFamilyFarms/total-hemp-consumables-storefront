import type { LucideIcon } from "lucide-react"
import {
  Amphora,
  Candy,
  Cannabis,
  Cigarette,
  FlaskConical,
  GlassWater,
  Home,
  Shirt,
  ShoppingBag,
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
  { label: "Edibles", href: (cc) => `/${cc}/store/edibles`, icon: Candy },
  // { label: "Gamma Gummies", href: (cc) => `/${cc}/gamma-gummies`, icon: FlaskConical },
  { label: "Elixirs", href: (cc) => `/${cc}/store/elixirs`, icon: FlaskConical },
  { label: "Beverages", href: (cc) => `/${cc}/store/beverages`, icon: GlassWater },
  { label: "Flower", href: (cc) => `/${cc}/store/flower`, icon: Cannabis },
  { label: "Prerolls", href: (cc) => `/${cc}/store/flower/prerolls`, icon: Cigarette },
  { label: "Packages", href: (cc) => `/${cc}/store/packages`, icon: Amphora },
  { label: "Merch", href: (cc) => `/${cc}/store/merch`, icon: Shirt },
]
