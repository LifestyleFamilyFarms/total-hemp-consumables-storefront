import { Flame, Moon, Sparkles } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const STRAIN_PROFILES = [
  {
    name: "Sativa",
    icon: Sparkles,
    badge: "Bright & social",
    description: "Citrus, pine, and limonene-led cultivars for creative mornings or shared sessions.",
    pairing: "Sparkling tonics · live resin vapes",
  },
  {
    name: "Indica",
    icon: Moon,
    badge: "Evening wind-down",
    description: "Heavy myrcene flower and low-dose edibles blended to soften the landing at night.",
    pairing: "Chocolate flights · rosin capsules",
  },
  {
    name: "Hybrids",
    icon: Flame,
    badge: "Balanced ritual",
    description: "Precision crossovers that flex between focus, creativity, and calm without harsh edges.",
    pairing: "Half-gram prerolls · nano tinctures",
  },
]

type Props = {
  compact?: boolean
}

export default function StrainHighlights({ compact = false }: Props) {
  if (compact) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/60">Shop by experience</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {STRAIN_PROFILES.map(({ name, icon: Icon, badge, description }) => (
            <Card
              key={name}
              className="flex items-start justify-between gap-3 rounded-2xl border border-border/40 bg-background/85 px-4 py-4 shadow-sm"
            >
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold text-foreground">{name}</CardTitle>
                <p className="text-xs font-medium text-primary">{badge}</p>
                <p className="text-xs text-foreground/60">{description}</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/40 bg-background text-primary">
                <Icon className="h-5 w-5" />
              </span>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/60">Shop by experience</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Start with how you want to feel.
          </h2>
        </div>
        <p className="text-sm text-foreground/70 sm:max-w-sm">
          We surface cultivars, deliveries, and supporting education the moment you pick a lane, reducing decision
          fatigue and boosting confidence.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STRAIN_PROFILES.map(({ name, icon: Icon, badge, description, pairing }) => (
          <Card
            key={name}
            className="group relative overflow-hidden rounded-[32px] border border-border/50 bg-background/90 shadow-[0_20px_45px_rgba(15,23,42,0.16)] backdrop-blur supports-[backdrop-filter]:bg-background/40"
          >
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-primary/20 via-background to-transparent blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-start justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-xl font-semibold tracking-tight text-foreground">{name}</CardTitle>
                <p className="text-sm font-medium text-primary">{badge}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-background/80 text-primary shadow-sm">
                <Icon className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardContent className="relative space-y-4 pt-0">
              <p className="text-sm text-foreground/70">{description}</p>
              <p className="text-xs uppercase tracking-[0.25em] text-foreground/50">
                Pair it with{" "}
                <span className="ml-2 text-foreground/80 normal-case tracking-normal">{pairing}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
