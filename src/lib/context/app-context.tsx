"use client"

import React, { createContext, useCallback, useContext, useMemo, useState } from "react"

type AppState = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
}

const AppContext = createContext<AppState | null>(null)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const openSidebar = useCallback(() => setSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const value = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
      openSidebar,
      closeSidebar,
    }),
    [sidebarOpen, toggleSidebar, openSidebar, closeSidebar]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error("useAppContext must be used within AppProvider")
  }
  return ctx
}

