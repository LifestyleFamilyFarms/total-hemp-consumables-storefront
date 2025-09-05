"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { cn } from "@lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Browse</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = !!item.items?.length

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {/* Expanded mode: the whole button is the trigger (chevron integrated) */}
                <div className="group-data-[collapsible=icon]:hidden">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {hasChildren && (
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </div>

                {/* Collapsed mode: render icon-only LINK to the parent URL; no chevron */}
                <div className="hidden group-data-[collapsible=icon]:block">
                  <div className="grid gap-1">
                    {/* Parent icon → navigates to the parent URL */}
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span className="sr-only">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>

                    {/* Chevron → opens popover with sublinks (only if children exist) */}
                    {hasChildren && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <SidebarMenuButton tooltip="Open submenu">
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Open submenu</span>
                          </SidebarMenuButton>
                        </PopoverTrigger>
                        <PopoverContent side="right" align="start" className="w-56 p-2">
                          <SidebarMenuSub>
                            {item.items!.map((sub) => (
                              <SidebarMenuSubItem key={sub.title}>
                                <SidebarMenuSubButton asChild>
                                  <Link href={sub.url}>
                                    <span>{sub.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>

                {/* Sublinks (only meaningful in expanded mode) */}
                {hasChildren && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items!.map((sub) => (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              href={sub.url}
                              className={cn(
                                pathname === sub.url && "bg-accent text-accent-foreground"
                              )}
                            >
                              <span>{sub.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
