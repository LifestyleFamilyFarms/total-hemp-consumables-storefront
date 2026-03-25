import Image from "next/image"
import BrandReveal from "./brand-reveal"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ShieldCheck, Leaf, Truck } from "lucide-react"

/* ────────────────────────────────────────────────────────
 * Hero Section — Total Hemp Consumables
 *
 * Design philosophy (Emil Kowalski school):
 *   → Every animation has a reason — entrance reveals hierarchy
 *   → Easing is the secret weapon (spring-like cubic-bezier)
 *   → Hover states reward curiosity, not demand attention
 *   → Ken Burns on the photo adds life without distraction
 *   → Breathing room between stagger delays lets each element land
 * ──────────────────────────────────────────────────────── */

const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)"
const EASE_OUT_BACK = "cubic-bezier(0.34, 1.56, 0.64, 1)"

function stagger(delayMs: number) {
  return {
    animation: `hero-fade-up 1000ms ${EASE_OUT_EXPO} forwards`,
    animationDelay: `${delayMs}ms`,
    opacity: 0,
  } as const
}

export default function HeroSection() {
  return (
    <section className="relative -mx-[50vw] -mt-[calc(4rem+2rem)] sm:-mt-[calc(4rem+2.5rem)] left-1/2 right-1/2 flex w-screen min-h-[100vh] items-center justify-center overflow-hidden pt-20">
      {/* Layer 1: Farm photo with Ken Burns drift + brand treatment */}
      <div className="brand-photo-hero absolute inset-0">
        <Image
          src="/images/hero/hemp-kola-farm-tall.webp"
          alt="Hemp kola in focus with red barn and silos at Lifestyle Family Farms, Grass Lake, Michigan"
          fill
          priority
          className="object-cover object-[center_25%] hero-ken-burns"
          sizes="100vw"
        />
      </div>

      {/* Layer 2: Gradient overlay — heavier at top and bottom for text, lighter in the middle to let the photo breathe */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background: [
            "linear-gradient(to bottom, rgba(5,14,8,0.45) 0%, rgba(5,14,8,0.15) 35%, rgba(5,14,8,0.10) 50%, rgba(5,14,8,0.30) 75%, rgba(5,14,8,0.75) 100%)",
          ].join(", "),
        }}
        aria-hidden="true"
      />

      {/* Layer 3: Vignette — draws eye to center content */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            "radial-gradient(ellipse 65% 60% at 50% 42%, transparent 0%, rgba(5,14,8,0.45) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Layer 4: Ambient glow — warm gold leak from bottom-center, very subtle */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            "radial-gradient(ellipse 50% 35% at 50% 85%, rgba(244,191,61,0.06) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Layer 5: Content — glass container wrapping everything */}
      <div className="relative z-10 mx-auto w-full max-w-[860px] px-4 py-8 sm:py-12">
        <div className="rounded-3xl border border-white/[0.06] bg-black/[0.35] px-8 py-14 text-center backdrop-blur-[2px] shadow-[0_8px_48px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.04)] sm:px-12 sm:py-16">
        <BrandReveal />

        {/* Headline */}
        <h1 className="mb-7">
          <span
            className="block text-3xl font-normal leading-[1.15] tracking-[-0.015em] text-white/90 text-cast-shadow small:text-5xl"
            style={stagger(600)}
          >
            Elevate Your
          </span>
          <span
            className="block bg-gradient-to-r from-gold via-[#e8a832] to-tangelo bg-clip-text text-5xl font-bold leading-[1.1] tracking-[-0.03em] text-transparent small:text-7xl"
            style={{
              animation: `hero-fade-up 1100ms ${EASE_OUT_BACK} forwards`,
              animationDelay: "850ms",
              opacity: 0,
            }}
          >
            Everyday
          </span>
        </h1>

        {/* Decorative rule — expands from center */}
        <div
          className="mx-auto mb-7 h-px w-20 bg-gradient-to-r from-transparent via-teal/50 to-transparent"
          style={{
            animation: `hero-rule-expand 800ms ${EASE_OUT_EXPO} forwards`,
            animationDelay: "1100ms",
            opacity: 0,
            transform: "scaleX(0)",
          }}
          aria-hidden="true"
        />

        {/* Subheadline */}
        <p
          className="mx-auto mb-12 max-w-[26rem] text-base font-normal leading-relaxed text-white/55 small:text-[1.125rem] small:leading-[1.7]"
          style={stagger(1250)}
        >
          Farm-grown hemp from Grass Lake, Michigan.
          <br className="hidden small:block" />
          Crafted for how you want to feel.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-wrap justify-center gap-4"
          style={stagger(1450)}
        >
          <LocalizedClientLink
            href="/store"
            className="group relative rounded-full bg-gradient-to-r from-gold to-[#d4941c] px-10 py-4 text-[0.95rem] font-semibold text-forest shadow-[0_4px_24px_rgba(244,191,61,0.2)] transition-all duration-500 ease-out hover:shadow-[0_8px_40px_rgba(244,191,61,0.35)] hover:brightness-110 active:scale-[0.97] active:duration-100"
          >
            <span className="relative z-10">Shop Now</span>
            {/* Glow ring on hover — appears behind the text */}
            <span
              className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(244,191,61,0.15) 0%, transparent 70%)",
              }}
              aria-hidden="true"
            />
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/content/about"
            className="rounded-full border border-white/[0.10] bg-white/[0.04] px-10 py-4 text-[0.95rem] font-normal text-white/65 backdrop-blur-sm transition-all duration-500 ease-out hover:border-white/[0.22] hover:bg-white/[0.08] hover:text-white/90 active:scale-[0.97] active:duration-100"
          >
            Our Farm Story
          </LocalizedClientLink>
        </div>

        {/* Trust badges */}
        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
          style={stagger(1650)}
        >
          {[
            { icon: ShieldCheck, text: "Lab Tested" },
            { icon: Leaf, text: "Farm Grown" },
            { icon: Truck, text: "Free Shipping $75+" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 text-white/25 transition-colors duration-300 hover:text-white/45"
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em]">
                {text}
              </span>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Scroll indicator — breathing chevron at bottom */}
      <div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        style={stagger(2000)}
      >
        <div
          className="flex flex-col items-center gap-1"
          style={{
            animation: "hero-scroll-hint 2.5s ease-in-out infinite",
            animationDelay: "2.5s",
          }}
        >
          <div className="h-8 w-[1px] bg-gradient-to-b from-transparent to-white/20" />
          <svg
            width="12"
            height="7"
            viewBox="0 0 12 7"
            fill="none"
            className="text-white/20"
          >
            <path
              d="M1 1L6 6L11 1"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Bottom fade into page background */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[4] h-28"
        style={{
          background:
            "linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.6) 40%, transparent 100%)",
        }}
        aria-hidden="true"
      />
    </section>
  )
}
