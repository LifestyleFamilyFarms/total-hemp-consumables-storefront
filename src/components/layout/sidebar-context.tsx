"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Ctx = {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<Ctx | null>(null)

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: {
  children: ReactNode
  defaultCollapsed?: boolean
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const toggle = () => setCollapsed((c) => !c)
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider")
  return ctx
}