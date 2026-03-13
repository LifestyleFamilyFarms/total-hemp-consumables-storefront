"use client"

import { HttpTypes } from "@medusajs/types"
import { useScrollReveal } from "@lib/hooks/use-scroll-reveal"
import { useStagger } from "@lib/hooks/use-stagger"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type ArrivalsSectionProps = {
  products: HttpTypes.StoreProduct[]
}

/** Maps common category handles to brand accent RGB values */
function getCategoryAccent(product: HttpTypes.StoreProduct): string {
  const cats = product.categories?.map((c) => c.handle?.toLowerCase()) ?? []
  if (cats.some((c) => c?.includes("gummy") || c?.includes("edible")))
    return "18,165,120"
  if (cats.some((c) => c?.includes("tincture"))) return "244,191,61"
  if (cats.some((c) => c?.includes("vape"))) return "229,101,37"
  if (cats.some((c) => c?.includes("flower"))) return "147,130,220"
  return "18,165,120" // default teal
}

export default function ArrivalsSection({
  products,
}: ArrivalsSectionProps) {
  const headerRef = useScrollReveal<HTMLDivElement>()
  const gridRef = useStagger<HTMLDivElement>({
    delayMs: 80,
    selector: ":scope > a",
  })

  if (!products.length) return null

  return (
    <section className="px-5 py-20 small:py-28">
      <div className="mx-auto max-w-6xl">
        <div
          ref={headerRef}
          className="scroll-reveal mb-8 flex items-baseline justify-between"
        >
          <h2 className="text-2xl font-normal text-white small:text-3xl">
            Just <span className="font-bold">Dropped</span>
          </h2>
          <LocalizedClientLink
            href="/store"
            className="border-b border-teal/30 text-sm text-teal/70 transition-colors duration-200 hover:text-teal"
          >
            View all
          </LocalizedClientLink>
        </div>

        <div
          ref={gridRef}
          className="stagger-children--scale grid grid-cols-2 gap-4 small:grid-cols-4"
        >
          {products.slice(0, 4).map((product) => {
            const thumbnail = product.thumbnail || product.images?.[0]?.url
            const accentRgb = getCategoryAccent(product)
            const { cheapestPrice } = getProductPrice({ product })

            return (
              <LocalizedClientLink
                key={product.id}
                href={`/products/${product.handle}`}
                className="group block overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.1]"
              >
                <div
                  className="flex aspect-square items-center justify-center"
                  style={{
                    background: `radial-gradient(circle at 50% 40%, rgba(${accentRgb}, 0.1), transparent 70%)`,
                  }}
                >
                  {thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt={product.title ?? "Product"}
                      width={200}
                      height={200}
                      className="h-auto max-h-[75%] w-auto max-w-[75%] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <span className="text-xs text-white/15">No image</span>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-[0.65rem] uppercase tracking-[0.1em] text-teal/70">
                    {product.categories?.[0]?.name ?? "Hemp"}
                  </span>
                  <h4 className="mt-1 text-sm font-medium text-white">
                    {product.title}
                  </h4>
                  {cheapestPrice?.calculated_price && (
                    <p className="mt-1 text-sm font-medium text-gold/80">
                      {cheapestPrice.calculated_price}
                    </p>
                  )}
                </div>
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>
    </section>
  )
}
