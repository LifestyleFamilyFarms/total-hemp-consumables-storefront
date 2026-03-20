import GradientMesh from "./gradient-mesh"
import ParticleCanvas from "./particle-canvas"
import BrandReveal from "./brand-reveal"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/** Inline SVG noise texture as data URI — avoids external file dependency */
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function HeroSection() {
  return (
    <section
      className="relative -mx-[50vw] left-1/2 right-1/2 flex w-screen min-h-[100dvh] items-center justify-center overflow-hidden"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 60% at 50% 45%, #0f2e1c 0%, #091a0f 50%, #050e08 100%)",
      }}
    >
      {/* Layer 1: Gradient mesh */}
      <GradientMesh />

      {/* Layer 2: Canvas particles — soft embers */}
      <ParticleCanvas particleCount={100} />

      {/* Layer 3: Noise grain texture */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] opacity-50"
        style={{
          backgroundImage: NOISE_SVG,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
        aria-hidden="true"
      />

      {/* Layer 4: Radial vignette — draws eye to center */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 50% 45%, transparent 0%, rgba(5,14,8,0.5) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Layer 5: Content */}
      <div className="relative z-10 mx-auto max-w-[780px] px-6 text-center">
        <BrandReveal />

        {/* Headline — stacked for dramatic weight */}
        <h1 className="mb-6">
          <span
            className="block text-3xl font-normal leading-tight tracking-[-0.01em] text-white/90 small:text-5xl"
            style={{
              animation:
                "hero-fade-up 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
              animationDelay: "500ms",
              opacity: 0,
            }}
          >
            Elevate Your
          </span>
          <span
            className="block bg-gradient-to-r from-gold via-[#e8a832] to-tangelo bg-clip-text text-5xl font-bold leading-tight tracking-[-0.02em] text-transparent small:text-7xl"
            style={{
              animation:
                "hero-fade-up 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
              animationDelay: "700ms",
              opacity: 0,
            }}
          >
            Everyday
          </span>
        </h1>

        {/* Decorative rule */}
        <div
          className="mx-auto mb-6 h-px w-16 bg-gradient-to-r from-transparent via-teal/40 to-transparent"
          style={{
            animation:
              "hero-fade-up 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            animationDelay: "900ms",
            opacity: 0,
          }}
          aria-hidden="true"
        />

        {/* Subheadline */}
        <p
          className="mx-auto mb-10 max-w-sm text-base font-normal leading-relaxed text-white/45 small:max-w-md small:text-lg"
          style={{
            animation:
              "hero-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            animationDelay: "1000ms",
            opacity: 0,
          }}
        >
          Premium hemp, crafted for how you want to feel.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-wrap justify-center gap-4"
          style={{
            animation:
              "hero-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            animationDelay: "1200ms",
            opacity: 0,
          }}
        >
          <LocalizedClientLink
            href="/store"
            className="rounded-full bg-gradient-to-r from-teal to-[#0d8a63] px-10 py-4 text-[0.95rem] font-medium text-white shadow-[0_4px_24px_rgba(18,165,120,0.3)] transition-all duration-300 hover:shadow-[0_6px_36px_rgba(18,165,120,0.45)] hover:brightness-110 active:scale-[0.98]"
          >
            Shop Now
          </LocalizedClientLink>
          <a
            href="#shop-by-effect"
            className="rounded-full border border-white/[0.1] bg-white/[0.04] px-10 py-4 text-[0.95rem] font-normal text-white/70 transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-white/90"
          >
            Explore Effects
          </a>
        </div>

        {/* Trust micro-line */}
        <p
          className="mt-10 text-[0.65rem] uppercase tracking-[0.25em] text-white/15"
          style={{
            animation:
              "hero-fade-up 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            animationDelay: "1400ms",
            opacity: 0,
          }}
        >
          Lab-tested &middot; Premium quality &middot; Free shipping $75+
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        aria-hidden="true"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          animation: "hero-scroll-hint 3s ease-in-out infinite",
        }}
      >
        <span className="text-[0.6rem] uppercase tracking-[0.25em] text-white/20">
          Scroll
        </span>
        <div className="h-8 w-px bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </section>
  )
}
