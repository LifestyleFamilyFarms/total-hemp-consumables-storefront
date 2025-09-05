import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"
import SortBar from "@modules/store/components/sort-bar"
// MobileFilters intentionally not used right now

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
    <div className="pt-2 pb-6" data-testid="category-container">
      {/* No sidebar layout */}
      <div className="w-full">
        {/* Header: title + controls */}
        <div className="mb-6 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-semibold" data-testid="store-page-title">
            All products
          </h1>
          <div className="flex items-center gap-3">
            {/* Only our SortBar for now */}
            <SortBar value={sort} />
          </div>
        </div>

        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort as SortOptions}
            page={pageNumber}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate