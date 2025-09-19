import type { ReactNode } from "react"
import Link from "next/link"
import Script from "next/script"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import SiteFooter from "@/components/layout/footer"

const ACCEPT_SRC =
  process.env.NEXT_PUBLIC_AUTHNET_ENV === "production"
    ? "https://js.authorize.net/v1/Accept.js"
    : "https://jstest.authorize.net/v1/Accept.js"

export default async function CheckoutLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode: cc } = await params

  return (
    <div className="min-h-screen flex flex-col">
      {/* Load Authorize.Net Accept.js only on checkout pages */}
      <Script src={ACCEPT_SRC} strategy="afterInteractive" />

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${cc}`}>← Continue shopping</Link>
        </Button>
        <div className="text-sm text-foreground/70">Secure Checkout</div>
      </header>

      <Separator />

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 flex-1">{children}</main>
      <SiteFooter countryCode={cc} />
    </div>
  )
}
