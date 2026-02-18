"use client"

import { cn } from "@lib/utils"
import { useTheme } from "@/components/theme/theme-provider"
import { Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const { theme, setTheme, themes } = useTheme()
  const currentTheme = themes.find((item) => item.id === theme)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-10 rounded-full border-border/50 bg-background/70 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/40",
            compact ? "w-10 justify-center p-0" : "gap-2",
            className
          )}
          aria-label="Open theme picker"
        >
          <Palette className="h-4 w-4" />
          {!compact && (
            <span className="truncate text-[10px]">{currentTheme?.label ?? "Theme"}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {themes.map((item) => (
            <DropdownMenuRadioItem key={item.id} value={item.id} className="py-2">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{item.label}</span>
                {item.description ? (
                  <span className="text-xs text-foreground/60">{item.description}</span>
                ) : null}
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
