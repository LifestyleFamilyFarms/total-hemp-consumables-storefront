"use client"

import { HttpTypes } from "@medusajs/types"
import { useScrollReveal } from "@lib/hooks/use-scroll-reveal"
import { useStagger } from "@lib/hooks/use-stagger"
import CollectionProductCard from "./collection-product-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CollectionSectionProps = {
  collection: HttpTypes.StoreCollection | null
}

export default function CollectionSection({
  collection,
}: CollectionSectionProps) {
  const copyRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 })
  const gridRef = useStagger<HTMLDivElement>({
    delayMs: 100,
    selector: ":scope > a",
  })

  if (!collection || !collection.products?.length) return null

  const products = collection.products.slice(0, 4)

  return (
    <section className="px-5 py-20 small:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 small:grid-cols-2 small:gap-16">
          {/* Editorial copy — left side */}
          <div ref={copyRef} className="scroll-reveal--left">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold/70">
              Curated Collection
            </p>
            <h2 className="mb-4 text-2xl font-normal leading-snug text-white small:text-3xl">
              The{" "}
              <span className="font-bold text-gold">
                {collection.title}
              </span>
            </h2>
            {collection.metadata?.description && (
              <p className="mb-6 text-base leading-relaxed text-white/50">
                {String(collection.metadata.description)}
              </p>
            )}
            <LocalizedClientLink
              href={`/collections/${collection.handle}`}
              className="inline-block rounded-full border border-gold/25 bg-gold/10 px-7 py-3 text-sm text-gold transition-all duration-300 hover:bg-gold/20"
            >
              Explore Collection
            </LocalizedClientLink>
          </div>

          {/* Product grid — right side, 2x2 with masonry offset */}
          <div
            ref={gridRef}
            className="stagger-children--scale grid grid-cols-2 gap-3"
          >
            {products.map((product, i) => (
              <CollectionProductCard
                key={product.id}
                product={product}
                accentRgb="244,191,61"
                offset={i % 2 === 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
