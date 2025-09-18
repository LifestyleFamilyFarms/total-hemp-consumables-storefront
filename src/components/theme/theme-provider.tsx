"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

import { DEFAULT_THEME_ID, THEMES, type ThemeDefinition } from "@/themes/config"

const STORAGE_KEY = "total-hemp-theme"

type ThemeContextValue = {
  theme: string
  setTheme: (themeId: string) => void
  themes: ThemeDefinition[]
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME_ID,
}: {
  children: React.ReactNode
  defaultTheme?: string
}) {
  const [theme, setThemeState] = useState(defaultTheme)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && THEMES.some((item) => item.id === stored)) {
      setThemeState(stored)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    document.documentElement.setAttribute("data-theme", theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = (themeId: string) => {
    if (THEMES.some((item) => item.id === themeId)) {
      setThemeState(themeId)
    }
  }

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: THEMES,
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
