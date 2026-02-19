import { Suspense } from "react"
import { notFound } from "next/navigation"

import { HttpTypes } from "@medusajs/types"
import ProductDetailClient from "@modules/products/components/product-detail-client"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

const ProductTemplate = ({ product, countryCode }: ProductTemplateProps) => {
  if (!product?.id) {
    return notFound()
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-12 px-4 pb-20 pt-8 sm:px-6 lg:px-8 sm:pt-10">
      <ProductDetailClient product={product} countryCode={countryCode} />

      <section data-testid="related-products-container" className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          You may also like
        </h2>
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </section>
    </div>
  )
}

export default ProductTemplate
