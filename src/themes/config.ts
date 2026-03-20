export type ThemeDefinition = {
  id: string
  label: string
  description?: string
}

export const DEFAULT_THEME_ID = "indica"

export const THEMES: ThemeDefinition[] = [
  {
    id: "indica",
    label: "Indica",
    description: "Deep resin-rich tones — the brand default.",
  },
  {
    id: "daylight",
    label: "Daylight",
    description: "Clean off-white with forest green primary and gold accent.",
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "Forest-tinted dark mode with gold accents.",
  },
]
