"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User } from "lucide-react"
import { PRIMARY_NAV_ITEMS } from "@/components/layout/nav-data"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

export default function IconRail() {
  const pathname = usePathname()

  // Normalize helper: trim trailing slashes, keep root
  const normalize = (p: string) => {
    if (!p) return "/"
    const base = p.split("?")[0]
    if (base === "/") return "/"
    return base.replace(/\/+$/, "")
  }

  const pathnameNorm = normalize(pathname)
  const cc = pathname.split("/")[1] || "us"

  return (
    <nav
      className="fixed left-0 top-16 z-20 hidden w-12 flex-col items-center gap-3 border-r bg-background/70 py-2 backdrop-blur md:flex"
      style={{ bottom: "var(--bottom-bar-height, 4rem)" }}
      aria-label="Icon navigation"
    >
      <TooltipProvider>
        <div className="flex w-full flex-col items-center gap-2">
          {PRIMARY_NAV_ITEMS.filter((it) => !!it.icon).map((it) => {
            const Icon = it.icon!
            const href = it.href ? it.href(cc) : "#"
            const hrefNorm = normalize(href)

          // Active logic: Home must match exactly "/{cc}"; others allow exact or prefix
          const isHome = hrefNorm === `/${cc}`
          const active = isHome
            ? pathnameNorm === `/${cc}`
            : pathnameNorm === hrefNorm || pathnameNorm.startsWith(hrefNorm + "/")

          return (
            <Tooltip key={it.label}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  aria-label={it.label}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-md border",
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background/60 text-foreground/80 border-border/60 hover:bg-muted/60",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{it.label}</TooltipContent>
            </Tooltip>
          )
          })}
        </div>

      {/* bottom account icon */}
        <div className="mt-auto flex w-full items-center justify-center pb-1">
          {(() => {
            const href = `/${cc}/account`
            const active = pathnameNorm === href || pathnameNorm.startsWith(href + "/")
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    aria-label="Account"
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-md border",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background/60 text-foreground/80 border-border/60 hover:bg-muted/60",
                    ].join(" ")}
                  >
                    <User className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Account</TooltipContent>
              </Tooltip>
            )
          })()}
        </div>
      </TooltipProvider>
    </nav>
  )
}
