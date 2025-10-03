import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "We'll be right back | Total Hemp Consumables",
}

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-center">
      <div className="max-w-xl space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">
          Scheduled maintenance
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          We&apos;re pausing new orders for a moment.
        </h1>
        <p className="text-base text-foreground/70">
          Total Hemp Consumables is temporarily offline while we finalize the next release. Check back soon or
          email <a className="text-primary underline" href="mailto:info@totalhemp.co">info@totalhemp.co</a> and we&apos;ll
          reach out as soon as we&apos;re live again.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="mailto:info@totalhemp.co"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-background shadow-sm transition hover:bg-primary/90"
          >
            Contact support
          </Link>
          <Link
            href="https://www.instagram.com/totalhempco"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground/80 transition hover:border-foreground hover:text-foreground"
          >
            Follow updates
          </Link>
        </div>
      </div>
    </main>
  )
}
