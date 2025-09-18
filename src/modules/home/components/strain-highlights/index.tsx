import { Flame, Moon, Sparkles } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const strains = [
  {
    name: "Sativa",
    description: "Bright terpene profiles and uplifting cannabinoids designed for creative flow and daytime rituals.",
    icon: Sparkles,
    badge: "Daytime"
  },
  {
    name: "Indica",
    description: "Earthy, calming cultivars with rich minor cannabinoid content to unwind evening energy.",
    icon: Moon,
    badge: "Evening"
  },
  {
    name: "Hybrids",
    description: "Balanced strains that harmonize mind and body—curated for social ease and subtle relief.",
    icon: Flame,
    badge: "All scenarios"
  },
]

export default function StrainHighlights() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">Shop by experience</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Find your perfect profile</h2>
        <p className="mt-3 text-sm text-foreground/70 sm:text-base">
          We cultivate small-batch genetics matched to the mood you’re seeking. Explore terpene-forward selections for any moment.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {strains.map(({ name, description, icon: Icon, badge }) => (
          <Card
            key={name}
            className="group relative overflow-hidden border border-border/60 bg-background/80 shadow-[0_16px_32px_rgba(15,23,42,0.12)] backdrop-blur supports-[backdrop-filter]:bg-background/40"
          >
            <div className="absolute -right-16 -top-24 h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 via-background to-transparent blur-2xl transition-opacity duration-500 group-hover:opacity-80" />
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight text-foreground">{name}</CardTitle>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/60">
                  {badge}
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background/80 text-primary shadow-sm">
                <Icon className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
