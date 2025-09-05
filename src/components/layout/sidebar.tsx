"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV_ITEMS } from "./nav-data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@lib/utils"
import { useSidebar } from "./sidebar-context"

export default function Sidebar({ countryCode }: { countryCode: string }) {
  const pathname = usePathname()
  const { collapsed } = useSidebar()
  const items = NAV_ITEMS

  // Expand the parent section if a child is active
  const activeParent = items.find((it) => it.children?.some((c) => pathname === c.href(countryCode)))
  const defaultAccordion = activeParent?.label

  return (
    <aside className="h-full bg-background">
      <ScrollArea className="h-full">
        <div className={cn("px-3 py-4", collapsed && "px-2")}>
          <div
            className={cn(
              "pb-2 text-xs font-semibold uppercase text-foreground/60",
              collapsed && "text-center"
            )}
          >
            Browse
          </div>

          <TooltipProvider delayDuration={200}>
            <nav className="grid gap-1">
              {items.map((item) => {
                // Simple link (no children)
                if (!item.children?.length && item.href) {
                  const href = item.href(countryCode)
                  const active = pathname === href

                  const linkEl = (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "group flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                        collapsed && "justify-center"
                      )}
                    >
                      {item.icon ? <item.icon className="h-4 w-4" /> : null}
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  )

                  return collapsed ? (
                    <Tooltip key={href}>
                      <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    linkEl
                  )
                }

                // Parent with children
                const parentBtn = (
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                      "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                      collapsed && "justify-center"
                    )}
                  >
                    {item.icon ? <item.icon className="h-4 w-4" /> : null}
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                )

                if (collapsed) {
                  // Collapsed: show children in a popover on click/hover
                  return (
                    <Popover key={item.label}>
                      <PopoverTrigger asChild>
                        <button className="w-full">{parentBtn}</button>
                      </PopoverTrigger>
                      <PopoverContent side="right" className="w-56 p-2">
                        <div className="grid gap-1">
                          {item.children?.map((c) => {
                            const href = c.href(countryCode)
                            const active = pathname === href
                            return (
                              <Link
                                key={href}
                                href={href}
                                className={cn(
                                  "block rounded-md px-2 py-2 text-sm transition-colors",
                                  active
                                    ? "bg-accent text-accent-foreground"
                                    : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                {c.label}
                              </Link>
                            )
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )
                }

                // Expanded: render as accordion group
                return (
                  <Accordion
                    key={item.label}
                    type="single"
                    collapsible
                    defaultValue={defaultAccordion}
                  >
                    <AccordionItem value={item.label}>
                      <AccordionTrigger className="rounded-md px-2 py-2 text-sm hover:no-underline">
                        {parentBtn}
                      </AccordionTrigger>
                      <AccordionContent className="pl-6">
                        <div className="grid gap-1 py-1">
                          {item.children?.map((c) => {
                            const href = c.href(countryCode)
                            const active = pathname === href
                            return (
                              <Link
                                key={href}
                                href={href}
                                className={cn(
                                  "block rounded-md px-2 py-2 text-sm transition-colors",
                                  active
                                    ? "bg-accent text-accent-foreground"
                                    : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                {c.label}
                              </Link>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )
              })}
            </nav>
          </TooltipProvider>

          <Separator className="my-4" />
          <div className={cn("text-xs text-foreground/60", collapsed ? "text-center" : "px-2")}>
            © {new Date().getFullYear()} Total Hemp
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
}