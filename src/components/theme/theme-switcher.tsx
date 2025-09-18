"use client"

import { cn } from "@lib/utils"
import { useTheme } from "@/components/theme/theme-provider"

export function ThemeSwitcher({
  className,
  id = "theme-select",
}: {
  className?: string
  id?: string
}) {
  const { theme, setTheme, themes } = useTheme()

  return (
    <div
      className={cn(
        "flex h-8 font-extrabold items-center content-center justify-between gap-1 rounded-sm border border-border/50 bg-background/70 px-2 text-[10px] tracking-[0.08em] text-foreground/70 shadow-lg backdrop-blur-xl supports-[backdrop-filter]:bg-background/40",
        className
      )}
    >
      <label className="flex-1 text-center" htmlFor={id}>
        {`Vibe  `}
      </label>
      <select
        id={id}
        value={theme}
        onChange={(event) => setTheme(event.target.value)}
        className="flex-1 h-5 rounded-sm border border-border/60 bg-transparent px-3 text-[10px] font-semibold tracking-[0.12em] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {themes.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  )
}
