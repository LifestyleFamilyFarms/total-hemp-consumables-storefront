import Image from "next/image"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PreviewPrice from "./price"

const BADGES: Record<string, string> = {
  sativa: "Sativa",
  indica: "Indica",
  hybrid: "Hybrid",
}

function getBadge(product: HttpTypes.StoreProduct) {
  const strain = (product?.metadata?.strain as string | undefined)?.toLowerCase()
  if (!strain) return null
  const key = Object.keys(BADGES).find((k) => strain.includes(k))
  return key ? BADGES[key] : null
}

export default function ProductPreview({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({ product })
  const badge = getBadge(product)
  const image = product.thumbnail || product.images?.[0]?.url || null

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-background/90 shadow-[0_18px_38px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-transform hover:-translate-y-1 supports-[backdrop-filter]:bg-background/50">
        <div className="relative flex aspect-[4/5] items-end justify-between overflow-hidden bg-background/60">
          {image ? (
            <Image src={image} alt={product.title} fill className="object-cover object-center transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">No image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
          <div className="relative flex w-full items-center justify-between px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">Δ9 &lt; 0.3%</span>
            {badge ? (
              <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary shadow-sm">
                {badge}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold tracking-tight text-foreground line-clamp-2">{product.title}</h3>
            {cheapestPrice ? (
              <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-semibold">
                <PreviewPrice price={cheapestPrice} />
              </span>
            ) : null}
          </div>
          {product.description ? (
            <p className="text-sm text-foreground/70 line-clamp-3">{product.description}</p>
          ) : (
            <p className="text-sm text-foreground/60">Crafted with full-panel COAs and terpene profiles.</p>
          )}
          <div className="mt-auto flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-foreground/60">
            <span>Age 21+</span>
            <span>Ships regulated</span>
          </div>
        </div>
      </article>
    </LocalizedClientLink>
  )
}
