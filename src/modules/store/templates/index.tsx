import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"
import SortBar from "@modules/store/components/sort-bar"

const heroBullets = ["COA-linked products", "<0.3% Δ9-THC", "Nationwide shipping"]

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions | string
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = (sortBy as string) || "created_at"

  return (
    <div className="space-y-10 pb-16" data-testid="category-container">
      <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-gradient-to-br from-background via-background/80 to-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(18,165,120,0.16),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(244,191,61,0.18),_transparent_55%)]" />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-16 text-center sm:px-10 lg:flex-row lg:items-center lg:gap-12 lg:py-20 lg:text-left">
          <div className="flex-1 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">Explore the collection</p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              The best of Total Hemp Consumables, in one place.
            </h1>
            <p className="max-w-2xl text-sm text-foreground/70 sm:text-base">
              Shop curated botanicals, limited drops, and everyday essentials. Each product is full-panel tested, Farm Bill compliant, and labeled with terpene ratios so you can choose by experience.
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-border/50 bg-background/80 p-4 text-[11px] uppercase tracking-[0.25em] text-foreground/70 shadow-[0_18px_36px_rgba(15,23,42,0.16)] backdrop-blur supports-[backdrop-filter]:bg-background/40">
            {heroBullets.map((item) => (
              <div key={item} className="rounded-full border border-border/60 bg-background/80 px-3 py-2 text-center text-foreground/80">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 sm:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl" data-testid="store-page-title">
              All products
            </h2>
            <p className="text-sm text-foreground/60">Select a sort option or dive into the catalog—every product links to COAs and shipping availability.</p>
          </div>
          <SortBar value={sort} className="sm:self-end" />
        </div>

        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts sortBy={sort as SortOptions} page={pageNumber} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
