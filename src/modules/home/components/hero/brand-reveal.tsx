import { BrandLogo } from "@/components/brand/brand-logo"

export default function BrandReveal() {
  return (
    <div
      className="mb-10 flex justify-center"
      style={{
        animation: "hero-blur-reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
    >
      {/* Decorative orbiting ring */}
      <div className="relative">
        <div
          className="absolute -inset-6 rounded-full border border-white/[0.1]"
          style={{
            animation: "hero-orbit-ring 20s linear infinite",
          }}
          aria-hidden="true"
        >
          <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-gold/50 shadow-[0_0_8px_rgba(244,191,61,0.3)]" />
        </div>
        <div
          className="absolute -inset-12 rounded-full border border-white/[0.06]"
          style={{
            animation: "hero-orbit-ring 30s linear infinite reverse",
          }}
          aria-hidden="true"
        >
          <div className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-teal/40 shadow-[0_0_6px_rgba(18,165,120,0.3)]" />
        </div>

        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] shadow-[0_0_60px_rgba(18,165,120,0.08)] backdrop-blur-sm small:h-28 small:w-28">
          <BrandLogo
            variant="roundFullColorLogo"
            format="svg"
            size="md"
            className="h-[72px] w-[72px] small:h-20 small:w-20"
          />
        </div>
      </div>
    </div>
  )
}
