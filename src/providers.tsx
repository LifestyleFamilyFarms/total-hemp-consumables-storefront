"use client"

import { ThemeProvider } from "@/components/theme/theme-provider"
import { CartProvider } from "@lib/context/cart-context"
import React from "react"
import { AppProvider } from "@lib/context/app-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppProvider>
        <CartProvider>{children}</CartProvider>
      </AppProvider>
    </ThemeProvider>
  )
}
