import { Sparkles, Sun, Waves } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const flavors = [
  {
    name: "Solar Citrus",
    notes: "Meyer lemon, blood orange, ginger zest",
    effect: "Bright, focused lift",
    icon: Sun,
  },
  {
    name: "Spectrum Berry",
    notes: "Huckleberry, blackberry, hibiscus",
    effect: "Creative, euphoric energy",
    icon: Sparkles,
  },
  {
    name: "Lunar Nectar",
    notes: "Yuzu, jasmine, lavender",
    effect: "Gentle night-time clarity",
    icon: Waves,
  },
]

export default function FlavorShowcase() {
  return (
    <section id="gamma-flavors" className="mx-auto w-full max-w-6xl space-y-8 px-6 py-16 sm:px-10">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">Flavor flight</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Crafted in micro-batches for distinct moods.
        </h2>
        <p className="mt-3 text-sm text-foreground/70 sm:text-base">
          Each batch is nano-emulsified for rapid onset, layered with botanical notes for a guided flavor profile, and finished with real fruit reductions.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {flavors.map(({ name, notes, effect, icon: Icon }) => (
          <Card
            key={name}
            className="group relative overflow-hidden border border-border/50 bg-background/80 shadow-[0_18px_36px_rgba(15,23,42,0.16)] backdrop-blur supports-[backdrop-filter]:bg-background/40"
          >
            <div className="absolute -left-12 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-primary/15 via-transparent to-transparent blur-2xl transition-opacity duration-500 group-hover:opacity-80" />
            <CardHeader className="flex flex-row items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight text-foreground">{name}</CardTitle>
                <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/60">{effect}</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70">{notes}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
