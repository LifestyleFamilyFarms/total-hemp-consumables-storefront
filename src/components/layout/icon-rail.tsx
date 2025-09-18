"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"

export default function IconRail() {
  return (
    <div
      className="fixed left-0 top-14 z-20 hidden h-[calc(100svh-theme(spacing.14))] w-10 flex-col items-center justify-start gap-2 border-r bg-background/80 backdrop-blur md:flex"
      aria-label="Quick menu"
    >
      <SidebarTrigger aria-label="Open menu" className="mt-2" />
    </div>
  )
}

