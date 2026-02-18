"use client"

import { ThemeProvider } from "@/components/theme/theme-provider"
import { CartProvider } from "@lib/context/cart-context"
import React from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  )
}
