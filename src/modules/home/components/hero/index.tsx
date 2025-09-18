import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

type HeroProps = {
  countryCode: string
}

export default function Hero({ countryCode }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-border/50 bg-gradient-to-br from-primary/5 via-background to-secondary/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(18,165,120,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(244,191,61,0.22),_transparent_55%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-20 text-center sm:px-10 lg:flex-row lg:items-center lg:gap-12 lg:py-24 lg:text-left">
        <div className="flex-1 space-y-6">
          <p className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-foreground/70 shadow-sm backdrop-blur">
            Total Hemp Consumables
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Premium hemp-derived wellness, grown with intention.
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-foreground/70 sm:text-base">
            From regenerative soil to your doorstep, our cultivars are crafted for clarity, calm, and celebration. Explore strain-specific experiences, elevated edibles, and limited drops backed by full-panel compliance.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-start">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={`/${countryCode}/store`}>Shop the collection</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full border border-border/80 bg-background/50 sm:w-auto"
            >
              <Link href={`/${countryCode}/gamma-gummies`} className="inline-flex items-center gap-2">
                Gamma Gummies drop
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-border/40 bg-background/70 p-6 text-left shadow-[0_24px_48px_rgba(15,23,42,0.18)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/30">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">
              This season
            </h2>
            <p className="mt-2 text-lg font-semibold text-foreground">Harvest Highlights</p>
            <p className="text-sm text-foreground/70">
              Indica-forward cultivars for evening rituals, terpene-rich sativa carts for creative flow, and artisan edibles micro-dosed for clarity.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {["Full-panel COAs", "Farm Bill compliant", "Nationwide shipping"].map((item) => (
              <div key={item} className="rounded-lg border border-border/40 bg-background/80 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/70">
                {item}
              </div>
            ))}
          </div>
          <p className="rounded-xl border border-border/60 bg-background/80 px-4 py-3 text-xs text-foreground/70">
            We only work with regenerative farms registered under the 2018 Farm Bill. Every batch ships with lab documentation and terpene breakdowns so you always know what you’re experiencing.
          </p>
        </div>
      </div>
    </section>
  )
}
