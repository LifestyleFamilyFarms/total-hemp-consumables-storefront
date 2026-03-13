"use client"

import { useScrollReveal } from "@lib/hooks/use-scroll-reveal"
import { useStagger } from "@lib/hooks/use-stagger"
import CategoryCard from "./category-card"

type NavigationCategory = {
  id: string
  name: string
  handle: string
}

type CategorySectionProps = {
  categories: NavigationCategory[]
}

/** Accent color pairs for categories — cycles through brand palette */
const CATEGORY_ACCENTS: { accent: string; secondary: string }[] = [
  { accent: "18,165,120", secondary: "244,191,61" },   // teal + gold
  { accent: "229,101,37", secondary: "244,191,61" },   // tangelo + gold
  { accent: "147,130,220", secondary: "18,165,120" },   // purple-ish + teal
  { accent: "244,191,61", secondary: "229,101,37" },   // gold + tangelo
  { accent: "18,165,120", secondary: "147,130,220" },   // teal + purple-ish
  { accent: "229,101,37", secondary: "18,165,120" },   // tangelo + teal
]

/** Short descriptors for common hemp categories */
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  gummies: "Precision-dosed edibles",
  tinctures: "Sublingual drops",
  flower: "Premium hemp flower",
  vapes: "Cartridges & disposables",
  topicals: "Balms & creams",
  accessories: "Tools & gear",
  edibles: "Tasty hemp treats",
  capsules: "Easy daily doses",
  concentrates: "Potent extracts",
  pre_rolls: "Ready to enjoy",
}

export default function CategorySection({
  categories,
}: CategorySectionProps) {
  const headerRef = useScrollReveal<HTMLDivElement>()
  const gridRef = useStagger<HTMLDivElement>({ delayMs: 80, selector: ":scope > a" })

  if (!categories.length) return null

  const spotlightCategories = categories.slice(0, 6)

  return (
    <section className="px-5 py-20 small:py-28">
      <div className="mx-auto max-w-6xl">
        <div ref={headerRef} className="scroll-reveal mb-10 text-center">
          <h2 className="text-2xl font-normal text-white small:text-3xl">
            Browse by <span className="font-bold">Category</span>
          </h2>
        </div>

        <div
          ref={gridRef}
          className="stagger-children--scale grid grid-cols-1 gap-4 xsmall:grid-cols-2 small:grid-cols-3"
        >
          {spotlightCategories.map((cat, i) => {
            const colors = CATEGORY_ACCENTS[i % CATEGORY_ACCENTS.length]
            return (
              <CategoryCard
                key={cat.id}
                name={cat.name}
                handle={cat.handle}
                description={CATEGORY_DESCRIPTIONS[cat.handle.toLowerCase()]}
                accentRgb={colors.accent}
                secondaryRgb={colors.secondary}
                index={i}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
