import { Suspense } from "react"

import type { CatalogCategoryMediaCard, CategoryImageContract } from "@lib/data/categories"
import { getPlpFacetOptions } from "@lib/data/products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import {
  CatalogCategoryThumbnails,
  CategoryBanner,
  CategoryThumbnailGallery,
} from "@modules/store/components/category-media"
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
  categoryImages?: CategoryImageContract | null
  catalogCategoryCards?: CatalogCategoryMediaCard[]
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
  categoryImages,
  catalogCategoryCards,
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
        />
      </Suspense>
    </div>
  )

  if (layout === "split") {
    return (
      <div className="pb-16" data-testid="category-container">
        <section className="page-top-offset mx-auto w-full max-w-[1480px] px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8">
          <CategoryBanner categoryName={heading} banner={categoryImages?.banner} />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.33fr)_minmax(0,0.67fr)] lg:items-start">
            <aside className="space-y-4 lg:sticky lg:top-24">
              <header className="bg-card border border-border/30 space-y-3 rounded-xl p-6">
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
              <CategoryThumbnailGallery images={categoryImages} categoryName={heading} />
              {controls}
            </aside>
            <div>
              <CatalogCategoryThumbnails
                countryCode={countryCode}
                categories={catalogCategoryCards}
              />
              {results}
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="pb-16" data-testid="category-container">
      <section className="page-top-offset mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-8 sm:px-10 sm:pb-10">
        <CategoryBanner categoryName={heading} banner={categoryImages?.banner} />
        <header className="bg-card border border-border/30 space-y-3 rounded-xl p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl" data-testid="store-page-title">
            {heading}
          </h1>
          <p className="max-w-3xl text-sm text-foreground/70 sm:text-base">{description}</p>
        </header>

        <CategoryThumbnailGallery images={categoryImages} categoryName={heading} />
        <CatalogCategoryThumbnails countryCode={countryCode} categories={catalogCategoryCards} />

        {controls}

        {results}
      </section>
    </div>
  )
}

export default StoreTemplate
