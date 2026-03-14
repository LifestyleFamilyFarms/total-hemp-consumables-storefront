import LocalizedClientLink from "@modules/common/components/localized-client-link"

type EffectCardProps = {
  name: string
  tagline: string
  facetValue: string
  accentColor: string
  accentRgb: string
  icon: React.ReactNode
}

export default function EffectCard({
  name,
  tagline,
  facetValue,
  accentColor,
  accentRgb,
  icon,
}: EffectCardProps) {
  return (
    <LocalizedClientLink
      href={`/store?effect=${facetValue}`}
      className="group block rounded-2xl border bg-white/[0.04] p-7 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07]"
      style={{
        borderColor: `rgba(${accentRgb}, 0.2)`,
        boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.04)`,
      }}
    >
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
        style={{
          background: `rgba(${accentRgb}, 0.15)`,
          color: accentColor,
          boxShadow: `0 0 20px rgba(${accentRgb}, 0.1)`,
        }}
      >
        {icon}
      </div>
      <h3 className="mb-1.5 text-sm font-semibold text-white">{name}</h3>
      <p className="text-xs leading-relaxed text-white/50">{tagline}</p>
    </LocalizedClientLink>
  )
}
