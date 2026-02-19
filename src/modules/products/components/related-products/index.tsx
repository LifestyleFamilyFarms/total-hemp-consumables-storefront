import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const queryParams: HttpTypes.StoreProductListParams = {
    limit: 8,
    is_giftcard: false,
  }

  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }

  const related = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) =>
    response.products
      .filter((candidate) => candidate.id !== product.id)
      .slice(0, 4)
  )

  if (!related.length) {
    return null
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {related.map((item) => (
        <li key={item.id}>
          <ProductPreview product={item} region={region} />
        </li>
      ))}
    </ul>
  )
}
