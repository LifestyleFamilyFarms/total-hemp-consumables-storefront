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
      className="group block rounded-2xl border bg-white/[0.03] p-7 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
      style={{
        borderColor: `rgba(${accentRgb}, 0.15)`,
      }}
    >
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background: `rgba(${accentRgb}, 0.12)`,
          color: accentColor,
        }}
      >
        {icon}
      </div>
      <h3 className="mb-1.5 text-sm font-medium text-white">{name}</h3>
      <p className="text-xs leading-relaxed text-white/40">{tagline}</p>
    </LocalizedClientLink>
  )
}
