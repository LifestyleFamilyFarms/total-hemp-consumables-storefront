import { FlaskConical, ShieldCheck } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const labFacts = [
  "Full-panel COAs: potency, residual solvents, heavy metals, mycotoxins",
  "QR codes on every jar linking directly to third-party labs",
  "cGMP production facility with cold-cured extraction",
]

export default function LabPanel() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-10">
      <Card className="border border-border/60 bg-background/80 shadow-[0_20px_44px_rgba(15,23,42,0.18)] backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-primary">
              <FlaskConical className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Lab verified, compliant in every jurisdiction.
              </CardTitle>
              <p className="text-sm text-foreground/70">
                We partner with ISO/IEC 17025 accredited labs, keep everything under 0.3% Δ9-THC, and document every stage—from cultivar genetics to cannabinoid ratios.
              </p>
            </div>
          </div>
          <div className="rounded-full border border-border/60 bg-background px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-foreground/70">
            21+ only
          </div>
        </CardHeader>
        <Separator className="bg-border/40" />
        <CardContent className="grid gap-6 py-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4 text-sm leading-relaxed text-foreground/70">
            <p>
              Gamma Gummies are produced in small-batch runs to preserve volatile terpenes. Every harvest is nano-emulsified for rapid onset and predictable bioavailability.
            </p>
            <p>
              Our compliance team works directly with carriers and state regulators, so inventory availability updates in real time based on shipping rules.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-foreground/80">
            {labFacts.map((fact) => (
              <div key={fact} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/40 bg-background text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <p>{fact}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
