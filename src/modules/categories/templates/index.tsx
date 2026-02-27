import { notFound } from "next/navigation"

import { HttpTypes } from "@medusajs/types"
import { PlpCardStyle } from "@modules/store/lib/card-style"
import { SortOptions } from "@modules/store/lib/sort-options"
import StoreTemplate from "@modules/store/templates"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  q,
  countryCode,
  selectedCategories,
  selectedTypes,
  selectedEffects,
  selectedCompounds,
  cardStyle,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page: number
  q: string
  countryCode: string
  selectedCategories: string[]
  selectedTypes: string[]
  selectedEffects: string[]
  selectedCompounds: string[]
  cardStyle: PlpCardStyle
}) {
  if (!category || !countryCode) {
    notFound()
  }

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      q={q}
      category={selectedCategories}
      type={selectedTypes}
      effect={selectedEffects}
      compound={selectedCompounds}
      cardStyle={cardStyle}
      countryCode={countryCode}
      categoryId={category.id}
      heading={category.name}
      description={
        category.description ||
        `Browse the ${category.name} catalog with live pricing, variant options, and URL-shareable filters.`
      }
      eyebrow="Category"
      hideCategoryFilters
      layout="split"
      resultMode="variants"
      emptyStateTitle={`No products are currently assigned to ${category.name}.`}
      emptyStateDescription="This category is active, but the Store API returned zero products for it. Check category-product assignments in Medusa and revalidate the storefront cache."
    />
  )
}
