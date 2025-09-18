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
    children: [
      { label: "Indica", href: (cc) => `/${cc}/store/flower/indica` },
      { label: "Sativa", href: (cc) => `/${cc}/store/flower/sativa` },
      { label: "Hybrid", href: (cc) => `/${cc}/store/flower/hybrid` },
    ],
  },
  { label: "Prerolls", href: (cc) => `/${cc}/store/prerolls`, icon: Cigarette },
  {
    label: "Edibles",
    href: (cc) => `/${cc}/store/edibles`,
    icon: Candy,
    children: [{ label: "Gamma Gummies", href: (cc) => `/${cc}/gamma-gummies` }],
  },
  { label: "Gamma Gummies", href: (cc) => `/${cc}/gamma-gummies`, icon: FlaskConical },
  {
    label: "Vapes",
    href: (cc) => `/${cc}/store/vapes`,
    icon: PenTool,
    children: [
      { label: "Carts", href: (cc) => `/${cc}/store/vapes/carts` },
      { label: "Disposables", href: (cc) => `/${cc}/store/vapes/disposables` },
    ],
  },
  { label: "Concentrates", href: (cc) => `/${cc}/store/concentrates`, icon: Amphora },
  {
    label: "Packages",
    href: (cc) => `/${cc}/store/packages`,
    icon: Amphora,
    children: [
      { label: "Tailgate", href: (cc) => `/${cc}/store/packages/tailgate` },
      { label: "Golf", href: (cc) => `/${cc}/store/packages/golf` },
      { label: "Wedding", href: (cc) => `/${cc}/store/packages/wedding` },
    ],
  },
  {
    label: "Merch",
    href: (cc) => `/${cc}/store/merch`,
    icon: Shirt,
    children: [
      { label: "T-Shirts", href: (cc) => `/${cc}/store/merch/shirts` },
      { label: "Hats", href: (cc) => `/${cc}/store/merch/hats` },
      { label: "Hoodies", href: (cc) => `/${cc}/store/merch/hoodies` },
    ],
  },
]
