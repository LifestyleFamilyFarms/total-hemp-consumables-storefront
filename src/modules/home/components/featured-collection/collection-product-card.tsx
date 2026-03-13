import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type CollectionProductCardProps = {
  product: HttpTypes.StoreProduct
  accentRgb: string
  offset?: boolean
}

export default function CollectionProductCard({
  product,
  accentRgb,
  offset = false,
}: CollectionProductCardProps) {
  const thumbnail = product.thumbnail || product.images?.[0]?.url

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className={`group block overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] ${
        offset ? "mt-6" : ""
      }`}
    >
      <div
        className="flex aspect-[3/4] items-center justify-center p-4"
        style={{
          background: `radial-gradient(circle at 50% 40%, rgba(${accentRgb}, 0.1), transparent 70%)`,
        }}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={product.title ?? "Product"}
            width={200}
            height={260}
            className="h-auto max-h-[80%] w-auto max-w-[80%] object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="text-xs text-white/15">No image</span>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-sm font-medium text-white">{product.title}</h4>
      </div>
    </LocalizedClientLink>
  )
}
