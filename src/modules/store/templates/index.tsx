import { Suspense } from "react"

import { getPlpFacetOptions } from "@lib/data/products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PlpCardStyleSwitcher from "@modules/store/components/plp-card-style-switcher"
import { DEFAULT_PLP_CARD_STYLE, PlpCardStyle } from "@modules/store/lib/card-style"
import PlpControls from "@modules/store/components/plp-controls"
import { SortOptions } from "@modules/store/lib/sort-options"

import PaginatedProducts from "./paginated-products"

type StoreTemplateProps = {
  sortBy?: SortOptions
  page: number
  q: string
  category: string[]
  type: string[]
  effect: string[]
  compound: string[]
  countryCode: string
  categoryId?: string
  collectionId?: string
  productsIds?: string[]
  heading?: string
  description?: string
  eyebrow?: string
  hideCategoryFilters?: boolean
  emptyStateTitle?: string
  emptyStateDescription?: string
  layout?: "stacked" | "split"
  resultMode?: "products" | "variants"
  cardStyle?: PlpCardStyle
}

const StoreTemplate = async ({
  sortBy,
  page,
  q,
  category,
  type,
  effect,
  compound,
  countryCode,
  categoryId,
  collectionId,
  productsIds,
  heading = "Shop all products",
  description = "Discover compliant hemp products with transparent pricing, tested ingredients, and fast regional shipping.",
  eyebrow = "Catalog",
  emptyStateTitle,
  emptyStateDescription,
  layout = "stacked",
  resultMode = "products",
  cardStyle = DEFAULT_PLP_CARD_STYLE,
}: StoreTemplateProps) => {
  const facetOptions = await getPlpFacetOptions({
    countryCode,
    q,
    categoryHandles: category,
    categoryId,
    collectionId,
    productsIds,
  })

  const controls = (
    <PlpControls
      sort={sortBy || "created_at"}
      q={q}
      category={category}
      type={type}
      effect={effect}
      compound={compound}
      facetOptions={facetOptions}
    />
  )

  const results = (
    <div className="space-y-4">
      <PlpCardStyleSwitcher value={cardStyle} />
      <Suspense fallback={<SkeletonProductGrid />}>
        <PaginatedProducts
          sortBy={sortBy}
          page={page}
          query={q}
          categoryHandles={category}
          typeValues={type}
          effectValues={effect}
          compoundValues={compound}
          countryCode={countryCode}
          categoryId={categoryId}
          collectionId={collectionId}
          productsIds={productsIds}
          emptyStateTitle={emptyStateTitle}
          emptyStateDescription={emptyStateDescription}
          resultMode={resultMode}
          cardStyle={cardStyle}
        />
      </Suspense>
    </div>
  )

  if (layout === "split") {
    return (
      <div className="pb-16" data-testid="category-container">
        <section className="mx-auto w-full max-w-[1480px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.33fr)_minmax(0,0.67fr)] lg:items-start">
            <aside className="space-y-4 lg:sticky lg:top-24">
              <header className="surface-panel space-y-3 rounded-3xl border border-border/60 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">
                  {eyebrow}
                </p>
                <h1
                  className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
                  data-testid="store-page-title"
                >
                  {heading}
                </h1>
                <p className="text-sm text-foreground/70 sm:text-base">{description}</p>
              </header>
              {controls}
            </aside>
            <div>{results}</div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="pb-16" data-testid="category-container">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 sm:px-10 sm:py-10">
        <header className="surface-panel space-y-3 rounded-3xl border border-border/60 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl" data-testid="store-page-title">
            {heading}
          </h1>
          <p className="max-w-3xl text-sm text-foreground/70 sm:text-base">{description}</p>
        </header>

        {controls}

        {results}
      </section>
    </div>
  )
}

export default StoreTemplate
