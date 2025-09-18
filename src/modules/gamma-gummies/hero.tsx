import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function GammaHero({
  countryCode,
  signupAnchor = "#gamma-signup",
}: {
  countryCode: string
  signupAnchor?: string
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-[32px] border border-border/60 bg-background/80">
      <Image
        src="/disco_biscuits_assets/biscuits_background.png"
        alt="Gamma Gummies background"
        fill
        priority
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background/80 via-background/60 to-primary/20" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 py-20 text-center sm:px-12 lg:px-16 lg:py-24">
        <div className="w-full max-w-xl">
          <Image
            src="/disco_biscuits_assets/title_with_gummies.png"
            alt="Gamma Gummies"
            width={560}
            height={180}
            className="h-auto w-full"
            priority
          />
        </div>

        <div className="space-y-4 text-sm sm:text-base">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-foreground/70">Limited launch • Fall 2025</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Balanced gummies crafted for clarity, creativity, and clean energy.
          </h1>
          <p className="mx-auto max-w-2xl text-foreground/70">
            Gamma Gummies blend fast-onset nano-emulsified cannabinoids with botanical extracts. Zero corn syrup, zero dyes—just plant-powered lift with a crisp finish.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={signupAnchor}>Join the drop list</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full border border-border/70 bg-background/70 sm:w-auto">
            <Link href={`/${countryCode}/store`} className="inline-flex items-center gap-2">
              Visit the store
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
