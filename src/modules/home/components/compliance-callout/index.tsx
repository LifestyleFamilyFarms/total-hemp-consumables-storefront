import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const shippingStates = [
  "CA",
  "CO",
  "FL",
  "NY",
  "TX",
  "WA",
  "VA",
]

export default function ComplianceCallout() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-10">
      <Card className="border border-border/60 bg-background/80 shadow-[0_20px_40px_rgba(15,23,42,0.14)] backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <CardHeader className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">Compliance & transparency</p>
            <CardTitle className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              2018 Farm Bill compliant. Lab verified. Age-gated.
            </CardTitle>
          </div>
          <Button asChild variant="outline" size="sm" className="border border-border/70">
            <Link href="/compliance" prefetch>
              View compliance docs
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-8 sm:grid-cols-[2fr_1fr]">
          <div className="space-y-4 text-sm text-foreground/70">
            <p>
              All products are derived from federally legal hemp containing less than 0.3% Δ9-THC by dry weight. Every batch ships with full panel COAs and QR codes that link directly to third-party labs.
            </p>
            <p>
              We actively monitor state regulations. If a jurisdiction shifts, our catalog updates automatically so you never order outside the lines.
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-center text-[11px] uppercase tracking-[0.25em] text-foreground/70">
            <p className="mb-3 font-semibold text-foreground">Current shipping zones</p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {shippingStates.map((state) => (
                <span key={state} className="rounded-full border border-border/40 bg-background/80 px-2 py-1 text-foreground/80">
                  {state}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-foreground/60">
              21+ signature required. Additional states coming soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
