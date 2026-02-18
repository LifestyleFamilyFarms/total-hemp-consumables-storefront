export type ThemeDefinition = {
  id: string
  label: string
  description?: string
}

export const DEFAULT_THEME_ID = "sativa"

export const THEMES: ThemeDefinition[] = [
  {
    id: "sativa",
    label: "Sativa",
    description: "Bright citrus-forward tones for an uplifting daytime vibe.",
  },
  {
    id: "indica",
    label: "Indica",
    description: "Deep resin-rich tones inspired by heavier nighttime strains.",
  },
  {
    id: "light",
    label: "Light",
    description: "Clean daylight profile for bright spaces and long product browsing sessions.",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Low-glare profile for late-night sessions with reduced eye strain.",
  },
]
