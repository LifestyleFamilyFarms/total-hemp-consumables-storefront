import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "We'll be right back | Total Hemp Consumables",
}

export default function MaintenancePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background/90 to-primary/25 px-6 py-20 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(142,213,188,0.2),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(227,177,108,0.16),_transparent_60%)]" />
      <div className="max-w-2xl space-y-8 rounded-[36px] border border-border/40 bg-background/80 p-10 shadow-[0_32px_90px_rgba(12,23,34,0.32)] backdrop-blur-md supports-[backdrop-filter]:bg-background/55">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-foreground/60">
          Harvest underway
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          We&apos;re drying, curing, and prepping the next release.
        </h1>
        <div className="space-y-4 text-left text-base leading-relaxed text-foreground/70 sm:text-lg">
          <p>
            The latest cut is hanging in cold cure, slowly shedding moisture before trim, testing, and final pack.
            Each lot moves through the lab before we reopen the store with fresh flower, vapes, and edibles.
          </p>
          <p>
            Need product availability, wholesale allocations, or timeline details? Reach our sales team at{" "}
            <a className="text-primary underline" href="mailto:info@totalhemp.co">info@totalhemp.co</a>{" "}
            and we&apos;ll follow up between drying-room checks.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="mailto:info@totalhemp.co"
            className="rounded-full bg-primary px-7 py-3 text-sm font-medium text-background shadow-sm transition hover:bg-primary/90"
          >
            Contact sales
          </Link>
        </div>
      </div>
    </main>
  )
}
