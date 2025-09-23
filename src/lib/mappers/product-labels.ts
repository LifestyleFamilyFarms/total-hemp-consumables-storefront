import { HttpTypes } from "@medusajs/types"

export function labelForVariant(product: HttpTypes.StoreProduct, variant: HttpTypes.StoreProductVariant): string {
  const type = (product?.type as any)?.value?.toString().toLowerCase() || (product as any)?.type?.toLowerCase?.() || ""
  const md: any = variant?.metadata || {}
  if (type.includes("flower")) {
    return md.weight_label || md.weight_g ? `${md.weight_g} g` : readOption(variant, "Weight") || variant.title || ""
  }
  if (type.includes("edible")) {
    const dose = md.dose_mg ?? parseInt(readOption(variant, "Dose (mg)") || "")
    const pack = md.pack_count ?? parseInt(readOption(variant, "Pack Size") || "")
    if (dose && pack) return `${dose} mg × ${pack}`
    if (dose) return `${dose} mg`
  }
  if (type.includes("beverage")) {
    const serving = md.serving_mg ?? parseInt(readOption(variant, "Serving (mg)") || "")
    const vol = md.volume_oz ?? 12
    if (serving) return `${serving} mg • ${vol} oz`
  }
  return variant.title || fallbackTitle(variant)
}

export function subtitleForProduct(product: HttpTypes.StoreProduct): string | null {
  const type = (product?.type as any)?.value?.toString().toLowerCase() || ""
  if (type.includes("flower")) return "Available in 1/8 – 1 oz"
  if (type.includes("edible")) return "5–50 mg • packs of 10–100"
  if (type.includes("beverage")) return "5–10 mg • 12 oz"
  return null
}

function readOption(variant: HttpTypes.StoreProductVariant, title: string): string | undefined {
  const opts: any = (variant as any).options || {}
  return opts[title]
}

function fallbackTitle(v: HttpTypes.StoreProductVariant): string {
  const opts: any = (v as any).options
  if (opts && typeof opts === "object") {
    return Object.values(opts).filter(Boolean).join(" / ")
  }
  return ""
}

