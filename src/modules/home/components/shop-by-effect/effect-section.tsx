"use client"

import { useStagger } from "@lib/hooks/use-stagger"
import { useScrollReveal } from "@lib/hooks/use-scroll-reveal"
import EffectCard from "./effect-card"
import { RelaxIcon, FocusIcon, EnergyIcon, SleepIcon } from "./effect-icons"

const EFFECTS = [
  {
    name: "Relax",
    tagline: "Unwind & decompress",
    facetValue: "relaxation",
    accentColor: "#12a578",
    accentRgb: "18,165,120",
    Icon: RelaxIcon,
  },
  {
    name: "Focus",
    tagline: "Sharpen & create",
    facetValue: "focus",
    accentColor: "#f4bf3d",
    accentRgb: "244,191,61",
    Icon: FocusIcon,
  },
  {
    name: "Energy",
    tagline: "Uplift & energize",
    facetValue: "energy",
    accentColor: "#e56525",
    accentRgb: "229,101,37",
    Icon: EnergyIcon,
  },
  {
    name: "Sleep",
    tagline: "Rest & recover",
    facetValue: "sleep",
    accentColor: "var(--brand-cocoa, #8B6F47)",
    accentRgb: "139,111,71",
    Icon: SleepIcon,
  },
] as const

export default function EffectSection() {
  const headerRef = useScrollReveal<HTMLDivElement>()
  const gridRef = useStagger<HTMLDivElement>({ delayMs: 100 })

  return (
    <section id="shop-by-effect" className="px-5 py-20 small:py-28">
      <div className="mx-auto max-w-6xl">
        <div ref={headerRef} className="scroll-reveal mb-10 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-teal/70">
            Find Your Flow
          </p>
          <h2 className="text-2xl font-normal text-white small:text-3xl">
            Shop by <span className="font-bold">Effect</span>
          </h2>
        </div>

        <div
          ref={gridRef}
          className="stagger-children mx-auto grid max-w-3xl grid-cols-2 gap-4 small:grid-cols-4"
        >
          {EFFECTS.map((effect) => (
            <EffectCard
              key={effect.facetValue}
              name={effect.name}
              tagline={effect.tagline}
              facetValue={effect.facetValue}
              accentColor={effect.accentColor}
              accentRgb={effect.accentRgb}
              icon={<effect.Icon />}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
