import type { LucideIcon } from "lucide-react"
import {
  Amphora,
  Home,
  FlaskConical,
  Cannabis,
  Candy,
  Cigarette,
  PenTool,
  Shirt,
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
  {
    label: "Flower",
    href: (cc) => `/${cc}/store/flower`,
    icon: Cannabis,
  },
  {
    label: "Edibles",
    href: (cc) => `/${cc}/store/edibles`,
    icon: Candy,
  },
  { label: "Gamma Gummies", href: (cc) => `/${cc}/gamma-gummies`, icon: FlaskConical },
  {
    label: "Vapes",
    href: (cc) => `/${cc}/store/vapes`,
    icon: PenTool,
  },
  { label: "Concentrates", href: (cc) => `/${cc}/store/concentrates`, icon: Amphora },
  {
    label: "Packages",
    href: (cc) => `/${cc}/store/packages`,
    icon: Amphora,
  },
  {
    label: "Merch",
    href: (cc) => `/${cc}/store/merch`,
    icon: Shirt,
  },
]
