import { BrandLogo } from "@/components/brand/brand-logo"

export default function BrandReveal() {
  return (
    <div className="relative mb-8">
      {/* Large watermark brand mark — the hero's visual anchor */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%]"
        style={{
          animation:
            "hero-blur-reveal 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
        aria-hidden="true"
      >
        <div className="relative h-[280px] w-[280px] small:h-[380px] small:w-[380px]">
          {/* Radial glow behind the mark */}
          <div
            className="absolute inset-[-30%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(18,165,120,0.12) 0%, rgba(244,191,61,0.06) 40%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <BrandLogo
            variant="roundFullColorLogo"
            format="svg"
            size="orig"
            className="h-full w-full opacity-[0.12]"
          />
        </div>
      </div>

      {/* Foreground logo — crisp, smaller */}
      <div
        className="relative z-10 flex justify-center"
        style={{
          animation:
            "hero-blur-reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both",
        }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] shadow-[0_0_80px_rgba(18,165,120,0.12),0_0_30px_rgba(244,191,61,0.06)] backdrop-blur-sm small:h-24 small:w-24">
          <BrandLogo
            variant="roundFullColorLogo"
            format="svg"
            size="md"
            className="h-14 w-14 small:h-[68px] small:w-[68px]"
          />
        </div>
      </div>
    </div>
  )
}
