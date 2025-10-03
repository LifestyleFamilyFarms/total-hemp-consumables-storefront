import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "We'll be right back | Total Hemp Consumables",
}

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background/90 to-primary/15 px-6 py-16 text-center">
      <div className="max-w-xl space-y-7 rounded-[32px] border border-border/40 bg-background/75 p-8 shadow-[0_30px_80px_rgba(12,23,34,0.35)] backdrop-blur supports-[backdrop-filter]:bg-background/55">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">
          Harvest underway
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          We&apos;re drying, curing, and getting the next run ready.
        </h1>
        <p className="text-base text-foreground/70">
          The latest crop is hanging in the dry rooms and moving into cure. Once every lot clears testing, the store
          reopens with fresh flower and finished goods. Have a wholesale or support question? Email our team at
          {" "}
          <a className="text-primary underline" href="mailto:info@totalhemp.co">info@totalhemp.co</a> and we&apos;ll get back
          between processing checks.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="mailto:info@totalhemp.co"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-background shadow-sm transition hover:bg-primary/90"
          >
            Contact support
          </Link>
        </div>
      </div>
    </main>
  )
}
