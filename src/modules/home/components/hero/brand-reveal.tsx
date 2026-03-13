import { BrandLogo } from "@/components/brand/brand-logo"

export default function BrandReveal() {
  return (
    <div
      className="mb-8 flex justify-center"
      style={{
        animation: "hero-blur-reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm small:h-20 small:w-20">
        <BrandLogo
          slot="hero"
          format="svg"
          size="md"
          className="h-12 w-12"
        />
      </div>
    </div>
  )
}
