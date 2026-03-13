import GradientMesh from "./gradient-mesh"
import ParticleCanvas from "./particle-canvas"
import BrandReveal from "./brand-reveal"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function HeroSection() {
  return (
    <section
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a1f12] via-[#0d2818] to-[#1a3a2f]"
      style={{ minHeight: "100vh" }}
    >
      <GradientMesh />
      <ParticleCanvas particleCount={200} />

      <div className="relative z-10 mx-auto max-w-[680px] px-5 text-center">
        <BrandReveal />

        <h1 className="mb-4 text-4xl font-normal leading-tight tracking-tight text-white small:text-5xl">
          <span
            style={{
              animation: "hero-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
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
              animation: "hero-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
              animationDelay: "600ms",
              opacity: 0,
            }}
          >
            Everyday
          </span>
        </h1>

        <p
          className="mb-9 text-lg font-normal leading-relaxed text-white/60"
          style={{
            animation: "hero-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            animationDelay: "800ms",
            opacity: 0,
          }}
        >
          Premium hemp, crafted for how you want to feel.
        </p>

        <div
          className="flex flex-wrap justify-center gap-4"
          style={{
            animation: "hero-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            animationDelay: "1000ms",
            opacity: 0,
          }}
        >
          <LocalizedClientLink
            href="/store"
            className="rounded-full bg-gradient-to-r from-teal to-[#0d8a63] px-9 py-3.5 text-[0.95rem] font-medium text-white shadow-[0_4px_20px_rgba(18,165,120,0.3)] transition-all duration-300 hover:shadow-[0_4px_28px_rgba(18,165,120,0.45)] hover:brightness-110"
          >
            Shop Now
          </LocalizedClientLink>
          <a
            href="#shop-by-effect"
            className="rounded-full border border-white/12 bg-white/5 px-9 py-3.5 text-[0.95rem] font-normal text-white/85 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10"
          >
            Explore Effects
          </a>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          animation: "hero-scroll-hint 3s ease-in-out infinite",
        }}
      >
        <span className="text-[0.7rem] uppercase tracking-[0.15em] text-white/30">
          Scroll
        </span>
        <div className="h-6 w-px bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  )
}
