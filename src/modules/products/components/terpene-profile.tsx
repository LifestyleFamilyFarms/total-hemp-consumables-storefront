import { Fragment } from "react"

import { cn } from "@lib/utils"

const defaultProfile = [
  { name: "Limonene", percent: 32 },
  { name: "Myrcene", percent: 24 },
  { name: "Linalool", percent: 18 },
  { name: "Beta-Caryophyllene", percent: 14 },
  { name: "Humulene", percent: 12 },
]

type TerpeneEntry = {
  name: string
  percent: number
}

type TerpeneProfileProps = {
  profile?: TerpeneEntry[]
  className?: string
}

export default function TerpeneProfile({ profile, className }: TerpeneProfileProps) {
  const terpeneProfile = profile && profile.length ? profile : defaultProfile

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-background/80 p-5 shadow-[0_16px_32px_rgba(15,23,42,0.14)] backdrop-blur supports-[backdrop-filter]:bg-background/40",
        className
      )}
    >
      <header className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/60">
          Terpene fingerprint
        </h3>
        <span className="text-[11px] uppercase tracking-[0.25em] text-foreground/50">
          mg / g infused
        </span>
      </header>
      <ul className="space-y-3">
        {terpeneProfile.map((entry) => (
          <li key={entry.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-foreground/70">
              <span className="font-medium text-foreground">{entry.name}</span>
              <span>{entry.percent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border/40">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${Math.min(entry.percent, 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
