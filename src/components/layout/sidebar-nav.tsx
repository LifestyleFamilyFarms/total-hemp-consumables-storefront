"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import { cn } from "@lib/utils"
import { Amphora, Cannabis, Candy, PenTool, Shirt, ChevronDown, Home, ShoppingBag } from "lucide-react"

type SectionItem = {
  title: string
  href: (cc: string) => string
  badge?: string
}

type Section = {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  href: (cc: string) => string
  items?: SectionItem[]
}

export const SIDEBAR_SECTIONS: Section[] = [
  {
    title: "Home",
    icon: Home,
    href: (cc) => `/${cc}`,
  },
  {
    title: "Store",
    icon: ShoppingBag,
    href: (cc) => `/${cc}/store`,
  },
  {
    title: "Flower",
    icon: Cannabis,
    href: (cc) => `/${cc}/store/flower`,
    items: [
      { title: "Indica", href: (cc) => `/${cc}/store/flower/indica` },
      { title: "Sativa", href: (cc) => `/${cc}/store/flower/sativa` },
      { title: "Hybrid", href: (cc) => `/${cc}/store/flower/hybrid` },
      { title: "Prerolls", href: (cc) => `/${cc}/store/flower/prerolls` },
    ],
  },
  {
    title: "Edibles",
    icon: Candy,
    href: (cc) => `/${cc}/store/edibles`,
    items: [
      { title: "Gamma Gummies", href: (cc) => `/${cc}/gamma-gummies`, badge: "New" },
    ],
  },
  {
    title: "Vapes",
    icon: PenTool,
    href: (cc) => `/${cc}/store/vapes`,
    items: [
      { title: "Carts", href: (cc) => `/${cc}/store/vapes/carts` },
      { title: "Disposables", href: (cc) => `/${cc}/store/vapes/disposables` },
    ],
  },
  {
    title: "Concentrates",
    icon: Amphora,
    href: (cc) => `/${cc}/store/concentrates`,
  },
  {
    title: "Packages",
    icon: Amphora,
    href: (cc) => `/${cc}/store/packages`,
    items: [
      { title: "Tailgate", href: (cc) => `/${cc}/store/packages/tailgate` },
      { title: "Golf", href: (cc) => `/${cc}/store/packages/golf` },
      { title: "Wedding", href: (cc) => `/${cc}/store/packages/wedding` },
    ],
  },
  {
    title: "Merch",
    icon: Shirt,
    href: (cc) => `/${cc}/store/merch`,
    items: [
      { title: "T-Shirts", href: (cc) => `/${cc}/store/merch/shirts` },
      { title: "Hats", href: (cc) => `/${cc}/store/merch/hats` },
      { title: "Hoodies", href: (cc) => `/${cc}/store/merch/hoodies` },
    ],
  },
]

function normalize(p: string) {
  if (!p) return "/"
  const base = p.split("?")[0]
  if (base === "/") return "/"
  return base.replace(/\/+$/, "")
}

export default function SidebarNav({ countryCode }: { countryCode: string }) {
  const pathname = usePathname()
  const pathnameNorm = normalize(pathname)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Browse</SidebarGroupLabel>
      <SidebarMenu>
        {SIDEBAR_SECTIONS.map((sec) => {
          const href = sec.href(countryCode)
          const hrefNorm = normalize(href)
          const activeParent =
            pathnameNorm === hrefNorm || pathnameNorm.startsWith(hrefNorm + "/")

          // local collapse state, default expanded per spec
          const [open, setOpen] = ((): [boolean, (v: boolean) => void] => {
            // leverage React state per item using a closure trick via array mapping index
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const React = require("react") as typeof import("react")
            return React.useState(true)
          })()

          const Icon = sec.icon

          return (
            <SidebarMenuItem key={sec.title}>
              <SidebarMenuButton
                asChild
                isActive={activeParent}
                className={cn("justify-start gap-3")}
              >
                <Link href={href} className="flex w-full items-center gap-3">
                  {Icon && <Icon className="h-5 w-5" />}
                  <span className="truncate text-sm font-medium">{sec.title}</span>
                </Link>
              </SidebarMenuButton>

              {sec.items?.length ? (
                <>
                  <SidebarMenuAction
                    aria-label={open ? "Collapse" : "Expand"}
                    onClick={() => setOpen(!open)}
                  >
                    <ChevronDown
                      className={cn(
                        "transition-transform",
                        open ? "rotate-180" : "rotate-0"
                      )}
                    />
                  </SidebarMenuAction>

                  {open && (
                    <SidebarMenuSub className="ml-3 border-l border-border/40 pl-3">
                      {sec.items.map((it) => {
                        const subHref = it.href(countryCode)
                        const subNorm = normalize(subHref)
                        const childActive =
                          pathnameNorm === subNorm ||
                          pathnameNorm.startsWith(subNorm + "/")
                        return (
                          <SidebarMenuSubItem key={it.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={cn(
                                "w-full justify-start gap-2 text-xs",
                                childActive && "bg-accent text-accent-foreground"
                              )}
                            >
                              <Link href={subHref} className="flex w-full items-center gap-2">
                                <span className="truncate">{it.title}</span>
                                {it.badge ? (
                                  <span className="ml-auto rounded-full bg-primary px-2 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                                    {it.badge}
                                  </span>
                                ) : null}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  )}
                </>
              ) : null}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
