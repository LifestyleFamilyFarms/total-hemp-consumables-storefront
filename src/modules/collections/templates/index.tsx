import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/lib/sort-options"
import StoreTemplate from "@modules/store/templates"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  q,
  countryCode,
  selectedCategories,
  selectedTypes,
  selectedEffects,
  selectedCompounds,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page: number
  q: string
  countryCode: string
  selectedCategories: string[]
  selectedTypes: string[]
  selectedEffects: string[]
  selectedCompounds: string[]
}) {
  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      q={q}
      category={selectedCategories}
      type={selectedTypes}
      effect={selectedEffects}
      compound={selectedCompounds}
      countryCode={countryCode}
      collectionId={collection.id}
      heading={collection.title}
      description="Curated collection with full product data, variant-level pricing, and shareable URL filters."
      eyebrow="Collection"
    />
  )
}
