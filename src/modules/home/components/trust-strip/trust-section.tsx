"use client"

import { useScrollReveal } from "@lib/hooks/use-scroll-reveal"
import {
  LabTestedIcon,
  PremiumIcon,
  ShippingIcon,
  GuaranteeIcon,
} from "./trust-icons"

const TRUST_POINTS = [
  { label: "Lab Tested", color: "#12a578", Icon: LabTestedIcon },
  { label: "Premium Quality", color: "#f4bf3d", Icon: PremiumIcon },
  { label: "Fast Shipping", color: "#e56525", Icon: ShippingIcon },
  { label: "Satisfaction Guaranteed", color: "var(--brand-cocoa, #8B6F47)", Icon: GuaranteeIcon },
] as const

export default function TrustSection() {
  const ref = useScrollReveal<HTMLDivElement>()

  return (
    <section className="px-5 py-16">
      <div
        ref={ref}
        className="scroll-reveal mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-12 small:gap-16"
        style={{
          background:
            "linear-gradient(135deg, rgba(18,165,120,0.04), rgba(244,191,61,0.03))",
          borderRadius: "16px",
          padding: "32px 24px",
        }}
      >
        {TRUST_POINTS.map((point) => (
          <div key={point.label} className="text-center">
            <div className="mb-2" style={{ color: point.color }}>
              <point.Icon />
            </div>
            <p className="text-xs font-medium text-white/60">{point.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
