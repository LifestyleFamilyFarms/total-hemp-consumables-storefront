"use client"

import { useEffect, useRef } from "react"
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover"
import { ALLOWED_SHIPPING_STATES_LABEL } from "@lib/constants/shipping"

function PopLink({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="hover:underline text-foreground/70">{label}</button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="w-screen max-w-none p-0 z-50"
      >
        <div className="h-[92vh] sm:max-h-[60vh] overflow-y-auto">
          <div className="sticky top-0 z-10 flex justify-end border-b bg-popover/95 backdrop-blur px-3 py-2">
            <PopoverClose aria-label="Close" className="rounded p-1 text-foreground/80 hover:bg-muted">×</PopoverClose>
          </div>
          <div className="px-4 py-3 text-sm leading-relaxed space-y-2">
            {children}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function PopLinkPdf({ label, src }: { label: string; src: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="hover:underline text-foreground/70">{label}</button>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" sideOffset={8} className="w-screen max-w-none p-0 z-50">
        <div className="h-[92vh] sm:max-h-[70vh] overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-popover/95 backdrop-blur px-3 py-2">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-foreground/80 hover:underline"
            >
              Open PDF in new tab
            </a>
            <PopoverClose aria-label="Close" className="rounded p-1 text-foreground/80 hover:bg-muted">×</PopoverClose>
          </div>
          <iframe
            src={src + "#toolbar=0&navpanes=0&scrollbar=1"}
            title={label}
            className="w-full h-[85vh] sm:h-[62vh]"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function ComplianceBar() {
  const ref = useRef<HTMLDivElement | null>(null)

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
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] sm:text-xs text-foreground/70">
          <span>21+ Only</span>
          <span className="hidden sm:inline">•</span>
          <PopLink label="Shipping FAQ">
            <p>Please check here to see if your state or territory is on the list:</p>
            <p className="text-xs">{ALLOWED_SHIPPING_STATES_LABEL}</p>
            <p className="text-[11px] text-foreground/70">
              Note: We only ship to jurisdictions where our products are lawful. State availability may change.
            </p>
          </PopLink>
          <span className="hidden sm:inline">•</span>

          <PopLinkPdf label="Permit" src="/compliance/PrintPermit.pdf" />

          <span className="hidden sm:inline">•</span>

          <PopLink label="Disclaimer">
            <p className="whitespace-pre-line">
              All hemp-derived products sold on this website are compliant with the 2018 Agriculture Improvement
              Act (Farm Bill) and contain less than 0.3% Δ9-THC on a dry-weight basis; these products are derived
              from legally grown industrial hemp and are intended for sale only in jurisdictions where such
              products are lawful. We currently ship only to the following states:{" "}
              {ALLOWED_SHIPPING_STATES_LABEL}. Products are intended for adults 21+ only; by purchasing you
              represent that you are at least 21 years of age. These statements have not been evaluated by the
              Food and Drug Administration (FDA) and products are not intended to diagnose, treat, cure, or
              prevent any disease. Do not use if pregnant, breastfeeding, operating heavy machinery, or if you
              have a medical condition without consulting a licensed healthcare provider. Purchasers assume all
              responsibility for compliance with local laws and regulations; we are not responsible for any legal
              consequences that may arise from the purchase, possession, or use of our products in any
              jurisdiction.
            </p>
          </PopLink>

          <span className="hidden sm:inline">•</span>

          <PopLink label="Privacy">
            <p>This preview summarizes our privacy approach. Full policy will be available before checkout.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Collect only what we need to fulfill/support your order.</li>
              <li>No sale of personal data.</li>
              <li>Payment data processed by PCI-certified providers.</li>
            </ul>
          </PopLink>
        </div>
      </div>
    </div>
  )
}
