import { listProductsForPlp, listProductVariantsForPlp } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import VariantPreview from "@modules/products/components/variant-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/lib/sort-options"

const PRODUCT_LIMIT = 12

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  categoryHandles,
  typeValues,
  effectValues,
  compoundValues,
  query,
  countryCode,
  emptyStateTitle,
  emptyStateDescription,
  resultMode = "products",
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  categoryHandles?: string[]
  typeValues?: string[]
  effectValues?: string[]
  compoundValues?: string[]
  query?: string
  countryCode: string
  emptyStateTitle?: string
  emptyStateDescription?: string
  resultMode?: "products" | "variants"
}) {
  if (resultMode === "variants") {
    const { variants, count, totalPages } = await listProductVariantsForPlp({
      page,
      sortBy,
      countryCode,
      q: query,
      categoryHandles,
      typeValues,
      effectValues,
      compoundValues,
      categoryId,
      collectionId,
      productsIds,
    })

    if (!variants.length) {
      return (
        <div className="rounded-3xl border border-border/60 bg-card/50 px-6 py-14 text-center">
          <p className="text-xl font-semibold text-foreground">
            {emptyStateTitle || "No offerings matched this view."}
          </p>
          <p className="mt-2 text-sm text-foreground/70">
            {emptyStateDescription ||
              "Try removing one or more filters to broaden the catalog view."}
          </p>
        </div>
      )
    }

    const firstItem = (page - 1) * PRODUCT_LIMIT + 1
    const lastItem = Math.min(page * PRODUCT_LIMIT, count)

    return (
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-foreground/70">
          <p>
            Showing <span className="font-semibold text-foreground">{firstItem}</span>-
            <span className="font-semibold text-foreground">{lastItem}</span> of
            <span className="font-semibold text-foreground"> {count}</span> offerings
          </p>
          {totalPages > 1 ? <p>Page {page} of {totalPages}</p> : null}
        </div>

        <div
          className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          data-testid="products-list"
        >
          {variants.map((record) => (
            <VariantPreview key={record.id} record={record} />
          ))}
        </div>

        <Pagination data-testid="product-pagination" page={page} totalPages={totalPages} />
      </section>
    )
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const { products, count, totalPages } = await listProductsForPlp({
    page,
    sortBy,
    countryCode,
    q: query,
    categoryHandles,
    typeValues,
    effectValues,
    compoundValues,
    categoryId,
    collectionId,
    productsIds,
  })

  if (!products.length) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/50 px-6 py-14 text-center">
        <p className="text-xl font-semibold text-foreground">
          {emptyStateTitle || "No products matched this view."}
        </p>
        <p className="mt-2 text-sm text-foreground/70">
          {emptyStateDescription ||
            "Try removing one or more filters to broaden the catalog view."}
        </p>
      </div>
    )
  }

  const firstItem = (page - 1) * PRODUCT_LIMIT + 1
  const lastItem = Math.min(page * PRODUCT_LIMIT, count)

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-foreground/70">
        <p>
          Showing <span className="font-semibold text-foreground">{firstItem}</span>-
          <span className="font-semibold text-foreground">{lastItem}</span> of
          <span className="font-semibold text-foreground"> {count}</span> products
        </p>
        {totalPages > 1 ? <p>Page {page} of {totalPages}</p> : null}
      </div>

      <div
        className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        data-testid="products-list"
      >
        {products.map((product) => (
          <ProductPreview key={product.id} product={product} region={region} />
        ))}
      </div>

      <Pagination data-testid="product-pagination" page={page} totalPages={totalPages} />
    </section>
  )
}
