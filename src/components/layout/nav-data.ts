import type { 
  LucideIcon  } from "lucide-react"
import { 
  Amphora,
  Home, 
  FlaskConical, 
  User, 
  ShoppingBag, 
  Cannabis, 
  Candy,
  Cigarette,
  PenTool,
  Shirt } from "lucide-react"


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
  { 
    label: "Home", 
    href: (cc) => `/${cc}`, 
    icon: Home 
  },
  { 
    label: "Shop", 
    href: (cc) => `/${cc}/store`, 
    icon: ShoppingBag 
  },
  { 
    label: "Flower", 
    href: (cc) => `/${cc}`, 
    icon: Cannabis,
    children: [
      {
        label: "Indica",
        href: (cc) => `/${cc}`,
      },
      {
        label: "Sativa",
        href: (cc) => `/${cc}`,
      },
      {
        label: "Hybrid",
        href: (cc) => `/${cc}`,
      }
    ]
  },
  { 
    label: "Prerolls", 
    href: (cc) => `/${cc}`, 
    icon: Cigarette 
  },
  { 
    label: "Edibles", 
    href: (cc) => `/${cc}`, 
    icon: Candy,
    children: [
      {
        label: "Gamma Gummies",
        href: (cc) => `/${cc}/gamma-gummies`,
      }
    ]
  },
  { 
    label: "Vapes", 
    href: (cc) => `/${cc}/vapes`, 
    icon: PenTool,
    children: [
      { 
        label: "Carts",
        href: (cc) => `/${cc}`,
      },
      {
        label: "Disposables",
        href: (cc) => `/${cc}/`,
      }
    ]
  },
  { 
    label: "Concentrates", 
    href: (cc) => `/${cc}`, 
    icon: Amphora
  },
  { 
    label: "Merch", 
    href: (cc) => `/${cc}`, 
    icon: Shirt,
    children: [
      {
        label: "T-Shirts",
        href: (cc) => `/${cc}`,
      },
      {
        label: "Hats",
        href: (cc) => `/${cc}`,
      },  
      {
        label: "Hoodies",
        href: (cc) => `/${cc}`,
      },
    ]
  },
  { 
    label: "Gamma Gummies", 
    href: (cc) => `/${cc}/gamma-gummies`, 
    icon: FlaskConical 
  },
  { 
    label: "Account", 
    href: (cc) => `/${cc}/account`, 
    icon: User },
]

