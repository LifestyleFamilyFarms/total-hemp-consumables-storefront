import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {collection.title}
        </h3>
        <a
          href={`/collections/${collection.handle}`}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/70 transition-colors hover:text-foreground"
        >
          View collection
        </a>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pricedProducts.map((product) => (
          <ProductPreview key={product.id} product={product} region={region} />
        ))}
      </div>
    </div>
  )
}
