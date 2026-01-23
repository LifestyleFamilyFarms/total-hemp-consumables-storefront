import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

type HeroProps = {
  countryCode: string
}

export default function Hero({ countryCode }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-border/60 bg-background px-4 py-12 shadow-[0_45px_110px_rgba(6,10,22,0.6)] sm:px-8 sm:py-12 lg:px-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-48 h-96 w-96 rounded-full blur-3xl" style={{ background: "hsla(var(--primary), 0.35)" }} />
        <div className="absolute right-[-18%] top-[-10%] h-[460px] w-[460px] rounded-full blur-[120px]" style={{ background: "hsla(var(--accent, var(--primary)), 0.25)" }} />
        <div className="absolute inset-x-0 bottom-[-55%] h-[540px] bg-gradient-to-t from-[hsla(var(--background),1)] via-[hsla(var(--background),0.7)] to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-screen"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.5) 0, transparent 35%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.3) 0, transparent 32%), radial-gradient(circle at 60% 70%, rgba(255,255,255,0.35) 0, transparent 45%)",
          }}
        />
      </div>

      <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col gap-10">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-foreground/80 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur">
              Total Hemp
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Calm, modern, unmistakably premium.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-foreground/70">
              A hero built from scratch—no recycled bits, no old claims. Just a bold glass canvas for what you ship next.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="w-full rounded-2xl border border-primary/30 bg-primary text-primary-foreground shadow-[0_22px_42px_hsla(var(--primary),0.35)] transition hover:-translate-y-0.5 sm:w-auto"
            >
              <Link href={`/${countryCode}/store`}>Shop now</Link>
            </Button>
            <Link
              href={`/${countryCode}/collections`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border/50 bg-card/20 px-4 py-2 text-sm font-semibold text-foreground/85 shadow-[0_18px_44px_rgba(0,0,0,0.3)] backdrop-blur transition hover:border-border hover:text-foreground sm:w-auto"
            >
              View catalog
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[30px] border border-border/50 bg-card/15 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_36px_90px_rgba(5,8,20,0.55)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.3),transparent_36%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.22),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.18),transparent_42%)]" />
              <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" style={{ background: "hsla(var(--primary), 0.22)" }} />
            </div>

            <div className="relative grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-[20px] border border-border/50 bg-gradient-to-br from-card/20 via-card/10 to-card/20 p-4 shadow-[0_18px_48px_rgba(4,6,14,0.45)] backdrop-blur"
                  style={{
                    transform:
                      idx === 2 ? "translateY(10px)" : idx === 3 ? "translateY(-6px)" : idx === 4 ? "translateY(8px)" : "translateY(0px)",
                  }}
                >
                  <div className="absolute inset-0 opacity-0 transition group-hover:opacity-25">
                    <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.6),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.35),transparent_30%)]" />
                  </div>
                  <div className="relative z-10 space-y-2">
                    <p className="text-sm font-semibold text-foreground">Visual tile {idx}</p>
                    <p className="text-sm text-foreground/75">
                      Placeholder content. Swap with art, a short loop, or product collage.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-3 text-foreground/70">
              <span className="h-1.5 w-6 rounded-full bg-foreground/70" />
              <span className="h-1.5 w-3 rounded-full bg-foreground/30" />
              <span className="h-1.5 w-3 rounded-full bg-foreground/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
