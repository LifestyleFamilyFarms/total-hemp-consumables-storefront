import GradientMesh from "./gradient-mesh"
import ParticleCanvas from "./particle-canvas"
import BrandReveal from "./brand-reveal"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function HeroSection() {
  return (
    <section
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#071a0e] via-[#0a2216] to-[#0d1f18]"
      style={{ minHeight: "100vh" }}
    >
      {/* Layer 1: Gradient mesh */}
      <GradientMesh />

      {/* Layer 2: Canvas particles */}
      <ParticleCanvas particleCount={200} />

      {/* Decorative corner accents */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Top-left botanical arc */}
        <svg
          className="absolute -left-8 -top-8 h-40 w-40 text-teal/[0.08]"
          viewBox="0 0 160 160"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        >
          <circle cx="0" cy="0" r="120" />
          <circle cx="0" cy="0" r="80" />
        </svg>
        {/* Bottom-right botanical arc */}
        <svg
          className="absolute -bottom-8 -right-8 h-40 w-40 text-gold/[0.06]"
          viewBox="0 0 160 160"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        >
          <circle cx="160" cy="160" r="120" />
          <circle cx="160" cy="160" r="80" />
        </svg>
      </div>

      {/* Layer 3 + 4: Brand reveal + Content */}
      <div className="relative z-10 mx-auto max-w-[720px] px-5 text-center">
        <BrandReveal />

        {/* Headline */}
        <h1 className="mb-5 text-4xl font-normal leading-[1.15] tracking-tight text-white small:text-6xl">
          <span
            style={{
              animation:
                "hero-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
              animationDelay: "400ms",
              opacity: 0,
            }}
            className="inline-block"
          >
            Elevate Your{" "}
          </span>
          <span
            className="inline-block bg-gradient-to-r from-gold to-tangelo bg-clip-text font-bold text-transparent"
            style={{
              animation:
                "hero-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
              animationDelay: "600ms",
              opacity: 0,
            }}
          >
            Everyday
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="mx-auto mb-10 max-w-md text-base font-normal leading-relaxed text-white/50 small:text-lg"
          style={{
            animation:
              "hero-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            animationDelay: "800ms",
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
            animationDelay: "1000ms",
            opacity: 0,
          }}
        >
          <LocalizedClientLink
            href="/store"
            className="rounded-full bg-gradient-to-r from-teal to-[#0d8a63] px-10 py-4 text-[0.95rem] font-medium text-white shadow-[0_4px_24px_rgba(18,165,120,0.35)] transition-all duration-300 hover:shadow-[0_6px_32px_rgba(18,165,120,0.5)] hover:brightness-110 active:scale-[0.98]"
          >
            Shop Now
          </LocalizedClientLink>
          <a
            href="#shop-by-effect"
            className="rounded-full border border-white/[0.12] bg-white/[0.05] px-10 py-4 text-[0.95rem] font-normal text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.2] hover:bg-white/[0.1]"
          >
            Explore Effects
          </a>
        </div>

        {/* Floating trust line under CTAs */}
        <p
          className="mt-8 text-[0.7rem] uppercase tracking-[0.2em] text-white/20"
          style={{
            animation:
              "hero-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            animationDelay: "1200ms",
            opacity: 0,
          }}
        >
          Lab-tested &bull; Premium quality &bull; Free shipping 75+
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
        <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/25">
          Scroll
        </span>
        <div className="h-8 w-px bg-gradient-to-b from-white/25 to-transparent" />
      </div>
    </section>
  )
}
