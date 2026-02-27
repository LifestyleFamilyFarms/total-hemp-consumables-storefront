import type { ReactNode } from "react"
import Link from "next/link"
import Script from "next/script"
import { headers } from "next/headers"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import SiteFooter from "@/components/layout/footer"
import { BrandLogo } from "@/components/brand/brand-logo"

const ACCEPT_SRC =
  process.env.NEXT_PUBLIC_AUTHNET_ENV === "production"
    ? "https://js.authorize.net/v1/Accept.js"
    : "https://jstest.authorize.net/v1/Accept.js"

const GOOGLE_PLACES_SRC = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  ? `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`
  : null

export default async function CheckoutLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode: cc } = await params
  const nonceHeader = await headers()
  const nonce = nonceHeader.get("x-csp-nonce") || undefined

  return (
    <div className="shell-surface shell-surface--full min-h-screen flex flex-col">
      {/* Load Authorize.Net Accept.js only on checkout pages */}
      <Script src={ACCEPT_SRC} strategy="afterInteractive" nonce={nonce} />
      {GOOGLE_PLACES_SRC ? (
        <Script src={GOOGLE_PLACES_SRC} strategy="afterInteractive" nonce={nonce} />
      ) : null}

      <header className="surface-nav sticky top-0 z-40 border-b border-border/60 px-4 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 md:px-6">
        <div className="mx-auto flex w-full max-w-8xl items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="surface-button">
            <Link href={`/${cc}`}>Back to shopping</Link>
          </Button>
          <BrandLogo variant="navMonogram" className="w-8 sm:w-9" />
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/75">
            Secure Checkout
          </div>
        </div>
      </header>

      <Separator className="border-border/50" />

      <main className="mx-auto flex w-full max-w-8xl flex-1 px-4 py-6 sm:px-6 md:py-8">
        {children}
      </main>
      <SiteFooter countryCode={cc} />
    </div>
  )
}
