"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover"
import { ALLOWED_SHIPPING_STATES, ALLOWED_SHIPPING_STATES_LABEL } from "@lib/constants/shipping"
import { SUPPORT_EMAIL } from "@lib/constants/support"
import { CircleAlert, ExternalLink, FileText, Shield, ShieldCheck, Truck, X } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type PolicyPopoverProps = {
  label: string
  icon: ReactNode
  children: ReactNode
}

function PolicyPopover({ label, icon, children }: PolicyPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] font-medium text-foreground/80 transition hover:bg-muted/50 sm:text-xs">
          {icon}
          <span>{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="z-50 w-[min(94vw,30rem)] rounded-xl border-border/70 bg-popover/95 p-0 shadow-xl backdrop-blur"
      >
        <div className="max-h-[75vh] overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-popover/95 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/70">
              {label}
            </p>
            <PopoverClose
              aria-label="Close"
              className="rounded-md p-1 text-foreground/80 transition hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </PopoverClose>
          </div>
          <div className="space-y-3 px-4 py-3 text-xs leading-relaxed text-foreground/85 sm:text-sm">
            {children}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function ComplianceBar() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const update = () => {
      const h = ref.current?.offsetHeight || 64
      document.documentElement.style.setProperty("--bottom-bar-height", `${h}px`)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return (
    <div
      ref={ref}
      className="fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="contentinfo"
      aria-label="Compliance information"
    >
      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-2 text-foreground/75 sm:hidden">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
            <ShieldCheck className="h-3 w-3" />
            <span className="hidden min-[350px]:inline">21+ only</span>
          </span>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition hover:bg-muted/50">
                <Shield className="h-3 w-3" />
                Compliance
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="max-h-[82vh] overflow-y-auto rounded-t-2xl border-border/70 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-5"
            >
              <SheetHeader className="items-start text-left">
                <SheetTitle className="text-base">Compliance & Policies</SheetTitle>
                <SheetDescription>
                  Shipping, product, privacy, and permit information.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-5 text-sm leading-relaxed text-foreground/85">
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">
                    Shipping
                  </h3>
                  <p>
                    We currently ship to {ALLOWED_SHIPPING_STATES.length} approved
                    U.S. jurisdictions and process most orders in 2-5 business
                    days.
                  </p>
                  <LocalizedClientLink
                    href="/content/shipping-returns"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center gap-1 text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                  >
                    Shipping & Returns <ExternalLink className="h-3.5 w-3.5" />
                  </LocalizedClientLink>
                </section>

                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">
                    Product Disclaimer
                  </h3>
                  <ul className="list-disc space-y-1.5 pl-5">
                    <li>Products are for adults 21+ only.</li>
                    <li>Statements are not FDA-evaluated unless stated.</li>
                    <li>Not intended to diagnose, treat, cure, or prevent disease.</li>
                  </ul>
                  <LocalizedClientLink
                    href="/content/terms-of-use"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center gap-1 text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                  >
                    Terms of Service <ExternalLink className="h-3.5 w-3.5" />
                  </LocalizedClientLink>
                </section>

                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">
                    Privacy
                  </h3>
                  <p>
                    We collect data needed for fulfillment, support, and security.
                    You may request access, correction, or deletion.
                  </p>
                  <p>
                    Privacy requests:{" "}
                    <a
                      className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                      href={`mailto:${SUPPORT_EMAIL}`}
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </p>
                  <LocalizedClientLink
                    href="/content/privacy-policy"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center gap-1 text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                  >
                    Privacy Policy <ExternalLink className="h-3.5 w-3.5" />
                  </LocalizedClientLink>
                </section>

                <section className="space-y-2 border-t border-border/60 pt-4">
                  <a
                    href="/compliance/PrintPermit.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                  >
                    Permit PDF <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </section>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden flex-wrap items-center justify-center gap-2 text-foreground/75 sm:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] sm:text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            21+ Only
          </span>

          <PolicyPopover
            label="Shipping"
            icon={<Truck className="h-3.5 w-3.5" />}
          >
            <p>
              We currently ship to {ALLOWED_SHIPPING_STATES.length} approved U.S.
              jurisdictions. Orders are generally processed in 2-5 business days.
            </p>
            <p className="rounded-md border border-border/60 bg-muted/30 p-2 text-[11px] leading-5 text-foreground/75">
              {ALLOWED_SHIPPING_STATES_LABEL}
            </p>
            <p>
              We do not offer international shipping. Availability can change as
              laws and carrier requirements change.
            </p>
            <LocalizedClientLink
              href="/content/shipping-returns"
              className="inline-flex items-center gap-1 text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            >
              Read Shipping & Returns <ExternalLink className="h-3.5 w-3.5" />
            </LocalizedClientLink>
          </PolicyPopover>

          <PolicyPopover
            label="Product Disclaimer"
            icon={<CircleAlert className="h-3.5 w-3.5" />}
          >
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Products are intended for adults 21+ only.</li>
              <li>
                Statements have not been evaluated by the FDA unless explicitly
                stated.
              </li>
              <li>Products are not intended to diagnose, treat, cure, or prevent disease.</li>
              <li>
                Do not use if pregnant or nursing. Consult a physician if you
                have a medical condition or take prescription medication.
              </li>
            </ul>
            <LocalizedClientLink
              href="/content/terms-of-use"
              className="inline-flex items-center gap-1 text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            >
              Read Terms of Service <ExternalLink className="h-3.5 w-3.5" />
            </LocalizedClientLink>
          </PolicyPopover>

          <PolicyPopover
            label="Privacy"
            icon={<Shield className="h-3.5 w-3.5" />}
          >
            <ul className="list-disc space-y-1.5 pl-5">
              <li>We collect data needed for fulfillment, support, and security.</li>
              <li>We do not sell personal data for money.</li>
              <li>
                You can request access, correction, or deletion of personal data.
              </li>
            </ul>
            <p>
              Privacy requests:{" "}
              <a
                className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                href={`mailto:${SUPPORT_EMAIL}`}
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
            <LocalizedClientLink
              href="/content/privacy-policy"
              className="inline-flex items-center gap-1 text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            >
              Read Privacy Policy <ExternalLink className="h-3.5 w-3.5" />
            </LocalizedClientLink>
          </PolicyPopover>

          <a
            href="/compliance/PrintPermit.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] font-medium text-foreground/80 transition hover:bg-muted/50 sm:text-xs"
          >
            <FileText className="h-3.5 w-3.5" />
            Permit PDF
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
