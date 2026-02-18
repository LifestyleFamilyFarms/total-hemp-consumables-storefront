"use client"

import { ThemeProvider } from "@/components/theme/theme-provider"
import React from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
