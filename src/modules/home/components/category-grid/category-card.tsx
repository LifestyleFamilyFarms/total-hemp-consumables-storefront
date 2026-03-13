import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CategoryCardProps = {
  name: string
  handle: string
  description?: string
  accentRgb: string
  secondaryRgb: string
}

const BOTANICAL_CIRCLE_POSITIONS = [
  { top: "-10px", right: "-10px", size: 80 },
  { bottom: "-20px", left: "-15px", size: 60 },
  { top: "10px", left: "-15px", size: 70 },
  { bottom: "-5px", right: "-10px", size: 65 },
  { top: "50%", right: "-20px", size: 55 },
  { bottom: "10px", left: "50%", size: 50 },
]

export default function CategoryCard({
  name,
  handle,
  description,
  accentRgb,
  secondaryRgb,
  index,
}: CategoryCardProps & { index: number }) {
  const circle = BOTANICAL_CIRCLE_POSITIONS[index % BOTANICAL_CIRCLE_POSITIONS.length]

  return (
    <LocalizedClientLink
      href={`/categories/${handle}`}
      className="group relative block overflow-hidden rounded-[20px] border border-white/[0.06] p-10 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]"
      style={{
        background: `linear-gradient(135deg, rgba(${accentRgb}, 0.08), rgba(${secondaryRgb}, 0.05))`,
      }}
    >
      {/* Decorative botanical circle */}
      <div
        className="pointer-events-none absolute rounded-full border opacity-20 transition-opacity duration-500 group-hover:opacity-40"
        style={{
          top: circle.top,
          right: circle.right,
          bottom: circle.bottom,
          left: circle.left,
          width: circle.size,
          height: circle.size,
          borderColor: `rgba(${accentRgb}, 0.15)`,
        }}
        aria-hidden="true"
      />

      <h3 className="mb-1.5 text-base font-medium text-white">{name}</h3>
      {description && (
        <p className="text-sm text-white/35">{description}</p>
      )}
    </LocalizedClientLink>
  )
}
