import { HttpTypes } from "@medusajs/types"

const strainColors: Record<string, string> = {
  sativa: "bg-primary/20 text-primary",
  indica: "bg-foreground/80 text-background",
  hybrid: "bg-secondary/30 text-foreground",
}

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
  priceDisplay?: ReactNode
}

const ProductInfo = ({ product, priceDisplay }: ProductInfoProps) => {
  const metadata = product?.metadata || {}
  const strainRaw = (metadata?.strain as string | undefined)?.toLowerCase()
  const strainKey = strainRaw && Object.keys(strainColors).find((key) => strainRaw.includes(key))
  const strainLabel = strainKey ? strainKey.charAt(0).toUpperCase() + strainKey.slice(1) : null
  const strainClass = strainKey ? strainColors[strainKey] : "bg-background/70 text-foreground"
  const tagline = metadata?.tagline as string | undefined

  return (
    <div className="space-y-4" id="product-info">
      <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-foreground/60">
        {strainLabel ? (
          <span className={`rounded-full border border-border/60 px-3 py-1 text-[10px] font-semibold ${strainClass}`}>
            {strainLabel}
          </span>
        ) : null}
        {metadata?.harvest_batch ? <span>Batch {metadata.harvest_batch}</span> : null}
        <span>Δ9 &lt; 0.3%</span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl" data-testid="product-title">
        {product.title}
      </h1>

      {tagline ? <p className="text-sm text-foreground/70">{tagline}</p> : null}

      {priceDisplay ? <div>{priceDisplay}</div> : null}

      <p className="text-sm text-foreground/70 whitespace-pre-line" data-testid="product-description">
        {product.description || "Crafted with strain-specific terpenes and rigorous compliance."}
      </p>

      <dl className="grid gap-4 rounded-2xl border border-border/50 bg-background/80 p-4 text-sm text-foreground/70 shadow-[0_18px_32px_rgba(15,23,42,0.12)] backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="flex items-center justify-between gap-3">
          <dt className="uppercase tracking-[0.25em] text-foreground/60">Cannabinoids</dt>
          <dd className="font-medium">{(metadata?.cannabinoids as string) || "Full-spectrum hemp extract"}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="uppercase tracking-[0.25em] text-foreground/60">Terpenes</dt>
          <dd className="font-medium">{(metadata?.terpenes as string) || "Limonene • Myrcene • Linalool"}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="uppercase tracking-[0.25em] text-foreground/60">Net weight</dt>
          <dd className="font-medium">{product.weight ? `${product.weight} g` : "Varies by SKU"}</dd>
        </div>
      </dl>
    </div>
  )
}

export default ProductInfo
