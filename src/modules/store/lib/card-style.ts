export const PLP_CARD_STYLES = [
  "minimal",
  "cinematic",
  "natural",
  "all",
] as const

export type PlpCardStyle = (typeof PLP_CARD_STYLES)[number]
export type ResolvedPlpCardStyle = Exclude<PlpCardStyle, "all">

export const DEFAULT_PLP_CARD_STYLE: ResolvedPlpCardStyle = "cinematic"

export const PLP_CARD_STYLE_LABELS: Record<PlpCardStyle, string> = {
  minimal: "Minimal Glass",
  cinematic: "Cinematic Glass",
  natural: "Natural Glass",
  all: "Compare All",
}

const PREVIEW_STYLE_ROTATION: ResolvedPlpCardStyle[] = [
  "minimal",
  "cinematic",
  "natural",
]

export const isPlpCardStyle = (value: string): value is PlpCardStyle =>
  PLP_CARD_STYLES.includes(value as PlpCardStyle)

export const normalizePlpCardStyle = (
  value: string | string[] | undefined
): PlpCardStyle => {
  const first = Array.isArray(value) ? value[0] : value
  if (!first || !isPlpCardStyle(first)) {
    return DEFAULT_PLP_CARD_STYLE
  }
  return first
}

export const resolvePlpCardStyleForIndex = (
  cardStyle: PlpCardStyle,
  index: number
): ResolvedPlpCardStyle => {
  if (cardStyle === "all") {
    return PREVIEW_STYLE_ROTATION[index % PREVIEW_STYLE_ROTATION.length]
  }

  return cardStyle
}
