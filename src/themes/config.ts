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
    description: "Sunlit butter tones energized by tangelo and teal.",
  },
  {
    id: "indica",
    label: "Indica",
    description: "Dark forest palette with teal primaries and warm gold highlights.",
  },
  {
    id: "light",
    label: "Light",
    description: "Default shadcn/Tailwind neutral light palette.",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Default shadcn/Tailwind neutral dark palette.",
  },
]
