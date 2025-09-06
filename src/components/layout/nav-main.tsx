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

                {/* Collapsed mode: icons-only. Items with children expand the sidebar. */}
                <div className="hidden group-data-[collapsible=icon]:block">
                  {hasChildren ? (
                    <SidebarMenuButton
                      onClick={() => setOpen(true)}
                      className="relative w-full h-9 px-2 flex items-center justify-center"
                      aria-label={`${item.title} menu`}
                    >
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span className="sr-only">{item.title}</span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton asChild className="relative w-full h-9 px-2 flex items-center justify-center">
                      <Link href={item.url}>
                        {item.icon && <item.icon className="h-5 w-5" />}<span className="sr-only">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
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
