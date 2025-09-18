"use client"

import Link from "next/link"

export default function SiteFooter({ countryCode = "us" }: { countryCode?: string }) {
  return (
    <footer className="mt-10 border-t bg-background/80 py-10 text-sm text-foreground/80">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        <div>
          <div className="inline-flex h-9 w-40 items-center justify-center rounded-md border border-border/60 bg-background/80 text-[10px] font-semibold tracking-[0.2em] text-foreground/80 shadow-sm">
            HORIZONTAL LOGO
          </div>
          <p className="mt-3 text-xs text-foreground/60">
            Building compliant, COA-backed hemp products. 21+ only.
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/70">Shop</h3>
          <ul className="space-y-1">
            <li><Link href={`/${countryCode}/store/flower`} className="hover:underline">Flower</Link></li>
            <li><Link href={`/${countryCode}/store/edibles`} className="hover:underline">Edibles</Link></li>
            <li><Link href={`/${countryCode}/gamma-gummies`} className="hover:underline">Gamma Gummies</Link></li>
            <li><Link href={`/${countryCode}/store/vapes`} className="hover:underline">Vapes</Link></li>
            <li><Link href={`/${countryCode}/store/concentrates`} className="hover:underline">Concentrates</Link></li>
            <li><Link href={`/${countryCode}/store/merch`} className="hover:underline">Merch</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/70">Info</h3>
          <ul className="space-y-1">
            <li><a href="/compliance/PrintPermit.pdf" target="_blank" rel="noopener noreferrer" className="hover:underline">Permit (PDF)</a></li>
            <li><Link href={`/${countryCode}/store`} className="hover:underline">Shipping &amp; Availability</Link></li>
            <li><Link href={`/${countryCode}/account`} className="hover:underline">Account</Link></li>
            <li><Link href={`/${countryCode}/store`} className="hover:underline">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-8 w-full max-w-6xl px-4 text-[11px] text-foreground/60 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Total Hemp Consumables. All rights reserved.
      </div>
    </footer>
  )
}

