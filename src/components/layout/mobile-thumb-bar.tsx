"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Cannabis, PenTool, Candy, User, Menu } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@lib/utils"

export default function MobileThumbBar({ countryCode }: { countryCode: string }) {
  const pathname = usePathname()
  const { openMobile, toggleSidebar } = useSidebar()

  const items = [
    { key: "flower", label: "Flower", href: `/${countryCode}`, Icon: Cannabis },
    { key: "vapes", label: "Vapes", href: `/${countryCode}`, Icon: PenTool },
    { key: "edibles", label: "Edibles", href: `/${countryCode}`, Icon: Candy },
    { key: "account", label: "Account", href: `/${countryCode}`, Icon: User },
  ] as const

  return (
    <nav
      role="navigation"
      aria-label="Quick navigation"
      className={cn(
        "md:hidden fixed bottom-8 inset-x-0 z-50 border-t bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        openMobile && "hidden"
      )}
    >
      <ul className="grid grid-cols-5 items-center gap-1 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {items.map(({ key, label, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <li key={key} className="flex justify-center">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md px-2 py-1.5 text-xs",
                  active && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="leading-none">{label}</span>
              </Link>
            </li>
          )
        })}
        <li className="flex justify-center">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={openMobile ? "Close menu" : "Open menu"}
            className="flex flex-col items-center gap-1 rounded-md px-2 py-1.5 text-xs"
          >
            <Menu className="h-5 w-5" />
            <span className="leading-none">Menu</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
