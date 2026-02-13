import type { Metadata } from "next"
import { BrandLogo } from "@/components/brand/brand-logo"
import LaunchWaitlistForm from "@modules/maintenance/components/launch-waitlist-form"

export const metadata: Metadata = {
  title: "Grand Opening Soon | Total Hemp Consumables",
  description:
    "Total Hemp Consumables is in maintenance mode while we prepare launch inventory. Join the email list for grand opening alerts.",
}

export default function MaintenancePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/20 px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(142,213,188,0.2),_transparent_50%),radial-gradient(circle_at_bottom_right,_rgba(227,177,108,0.25),_transparent_55%)]" />

      <section className="w-full max-w-6xl rounded-[36px] border border-border/40 bg-background/80 p-7 shadow-[0_32px_90px_rgba(12,23,34,0.28)] backdrop-blur-md supports-[backdrop-filter]:bg-background/55 sm:p-10 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div className="space-y-6 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-foreground/60">Maintenance mode</p>

            <BrandLogo variant="heroWordmark" size="md" className="max-w-[320px]" priority />

            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Grand opening is close.
            </h1>

            <p className="text-base leading-relaxed text-foreground/75 sm:text-lg">
              We&apos;re in final production checks and compliance prep before opening the full storefront. Expect a
              launch lineup built around premium CBD and Delta-9 THC products.
            </p>

            <div className="rounded-2xl border border-border/50 bg-background/65 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-foreground/60">Coming online</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75 sm:text-base">
                Full product menus, lab-backed details, and fresh drops for flower, edibles, vapes, and more.
              </p>
            </div>

            <p className="text-sm leading-relaxed text-foreground/70">
              Need wholesale support or launch timeline details? Email{" "}
              <a className="font-semibold text-primary underline" href="mailto:info@totalhemp.co">
                info@totalhemp.co
              </a>
              .
            </p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/70 p-6 shadow-[0_18px_45px_rgba(12,23,34,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-foreground/60">Launch alerts</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              Drop your email for first access.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/70">
              We&apos;ll send one email when the storefront opens and occasional updates for major releases.
            </p>

            <div className="mt-6">
              <LaunchWaitlistForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
