"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type LucideIcon } from "lucide-react"
import { cn } from "@lib/utils"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export type NavMainItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: { title: string; url: string }[]
}

export function NavMain({ items }: { items: NavMainItem[] }) {
  const pathname = usePathname()
  const { setOpen } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Browse</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = !!item.items?.length
          const active = item.isActive ?? (pathname === item.url)

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={cn(
                  "justify-start gap-3",
                  active && "bg-accent text-accent-foreground"
                )}
              >
                <Link
                  href={item.url}
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-3"
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span className="truncate text-sm font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>

              {hasChildren ? (
                <SidebarMenuSub className="ml-3 border-l border-border/40 pl-3">
                  {item.items!.map((sub) => {
                    const childActive = pathname === sub.url
                    return (
                      <SidebarMenuSubItem key={sub.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={cn(
                            "w-full justify-start gap-2 text-xs",
                            childActive && "bg-accent text-accent-foreground"
                          )}
                        >
                          <Link
                            href={sub.url}
                            onClick={() => setOpen(false)}
                            className="flex w-full items-center gap-2"
                          >
                            <span className="truncate">{sub.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              ) : null}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
