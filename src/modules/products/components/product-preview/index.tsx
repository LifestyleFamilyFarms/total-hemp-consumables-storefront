import Image from "next/image"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { subtitleForProduct } from "@lib/mappers/product-labels"
import { convertToLocale } from "@lib/util/money"

const BADGES: Record<string, string> = {
  sativa: "Sativa",
  indica: "Indica",
  hybrid: "Hybrid",
}
const MAX_TAG_PILLS = 3
const EXCLUDED_TAG_PILLS = new Set([
  "proleve",
  "barney's botanicals",
  "barneys botanicals",
])

const TAG_PRIORITY_RULES: Array<{ pattern: RegExp; priority: number }> = [
  {
    pattern: /(sleep|focus|energy|calm|relax|relief|recovery|mood|balance|wellness)/i,
    priority: 0,
  },
  {
    pattern: /(cbd|cbg|thc|full spectrum|broad spectrum|isolate)/i,
    priority: 1,
  },
  {
    pattern:
      /(gummies|tinctures?|capsules?|topicals?|salve|lotion|roll[- ]?on|drinks?|shots?|baked goods|cookie|brownie)/i,
    priority: 2,
  },
  {
    pattern: /(vegan|thc[- ]?free|hemp[- ]?derived|melatonin|b12|farm bill compliant)/i,
    priority: 3,
  },
]

const PRIMARY_VARIANT_OPTION_PRIORITY: Array<{ pattern: RegExp; priority: number }> = [
  { pattern: /(strength|mg|milligram)/i, priority: 0 },
  { pattern: /(count|ct|pack|quantity)/i, priority: 1 },
  { pattern: /(size|volume|oz|ml)/i, priority: 2 },
  { pattern: /(flavor|strain)/i, priority: 3 },
]

function getBadge(product: HttpTypes.StoreProduct) {
  const strain = (product?.metadata?.strain as string | undefined)?.toLowerCase()

  if (!strain) {
    return null
  }

  const key = Object.keys(BADGES).find((item) => strain.includes(item))
  return key ? BADGES[key] : null
}

function getTagPills(product: HttpTypes.StoreProduct, badge: string | null) {
  const tags = (product.tags || [])
    .map((tag) => tag.value?.trim())
    .filter((value): value is string => Boolean(value))

  const uniqueTags = Array.from(new Set(tags))
    .filter((tag) => tag.toLowerCase() !== "lab-tested" && tag.toLowerCase() !== "lab tested")
    .filter((tag) => !EXCLUDED_TAG_PILLS.has(tag.toLowerCase()))
    .filter((tag) => (badge ? tag.toLowerCase() !== badge.toLowerCase() : true))

  if (!uniqueTags.length) {
    return ["Lab-tested"]
  }

  const rankedTags = uniqueTags
    .map((tag, index) => {
      const match = TAG_PRIORITY_RULES.find((rule) => rule.pattern.test(tag))
      return {
        tag,
        index,
        priority: match ? match.priority : 4,
      }
    })
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority
      }

      return left.index - right.index
    })

  return rankedTags.slice(0, MAX_TAG_PILLS).map((item) => item.tag)
}

function getPriceSummary(product: HttpTypes.StoreProduct) {
  const pricedVariants = (product.variants || [])
    .map((variant) => ({
      calculated: variant.calculated_price?.calculated_amount,
      original: variant.calculated_price?.original_amount,
      currencyCode: variant.calculated_price?.currency_code,
    }))
    .filter(
      (
        entry
      ): entry is {
        calculated: number
        original?: number | null
        currencyCode: string
      } => typeof entry.calculated === "number" && typeof entry.currencyCode === "string"
    )

  if (!pricedVariants.length) {
    return null
  }

  const minCalculated = Math.min(...pricedVariants.map((variant) => variant.calculated))
  const maxCalculated = Math.max(...pricedVariants.map((variant) => variant.calculated))
  const cheapestVariant = pricedVariants.find(
    (variant) => variant.calculated === minCalculated
  )

  return {
    minCalculated,
    maxCalculated,
    currencyCode: cheapestVariant?.currencyCode || pricedVariants[0].currencyCode,
    cheapestOriginal:
      typeof cheapestVariant?.original === "number"
        ? cheapestVariant.original
        : undefined,
  }
}

function getNumericValue(value: string) {
  const match = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/)
  if (!match) {
    return null
  }

  const parsed = Number.parseFloat(match[0])
  return Number.isFinite(parsed) ? parsed : null
}

function compareVariantValues(left: string, right: string) {
  const leftNumeric = getNumericValue(left)
  const rightNumeric = getNumericValue(right)

  if (leftNumeric !== null && rightNumeric !== null && leftNumeric !== rightNumeric) {
    return leftNumeric - rightNumeric
  }

  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

function formatOptionLabel(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getVariantPreview(product: HttpTypes.StoreProduct) {
  const optionLabelById = new Map<string, string>()
  const valuesByOptionId = new Map<string, Set<string>>()

  for (const option of product.options || []) {
    if (!option.id) {
      continue
    }

    optionLabelById.set(option.id, option.title || "Option")
  }

  for (const variant of product.variants || []) {
    for (const optionValue of variant.options || []) {
      const optionId = optionValue.option_id
      const value = optionValue.value?.trim()

      if (!optionId || !value) {
        continue
      }

      const entry = valuesByOptionId.get(optionId) || new Set<string>()
      entry.add(value)
      valuesByOptionId.set(optionId, entry)
    }
  }

  const rankedOptions = Array.from(valuesByOptionId.entries())
    .map(([optionId, values]) => {
      const label = optionLabelById.get(optionId) || "Option"
      const priorityMatch = PRIMARY_VARIANT_OPTION_PRIORITY.find((rule) =>
        rule.pattern.test(label)
      )

      return {
        optionId,
        label,
        values: Array.from(values).sort(compareVariantValues),
        valueCount: values.size,
        priority: priorityMatch ? priorityMatch.priority : 10,
      }
    })
    .filter((entry) => entry.valueCount > 1)
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority
      }

      if (left.valueCount !== right.valueCount) {
        return right.valueCount - left.valueCount
      }

      return left.label.localeCompare(right.label)
    })

  const primary = rankedOptions[0]

  if (!primary) {
    return null
  }

  const visibleValues = primary.values.slice(0, 3)
  const remaining = Math.max(primary.values.length - visibleValues.length, 0)

  return {
    label: formatOptionLabel(primary.label),
    values: visibleValues,
    remaining,
  }
}

export default function ProductPreview({
  product,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) {
  const badge = getBadge(product)
  const subtitle = subtitleForProduct(product)
  const image = product.thumbnail || product.images?.[0]?.url || null
  const price = getPriceSummary(product)
  const tagPills = getTagPills(product, badge)
  const variantPreview = getVariantPreview(product)

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-[0_16px_36px_rgba(15,23,42,0.14)] transition hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(15,23,42,0.2)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-background/60">
          {image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              No image
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />

          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
            {tagPills.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/60 bg-background/85 px-2.5 py-1 text-[10px] font-semibold text-foreground/85"
              >
                {tag}
              </span>
            ))}
            {badge ? (
              <span className="rounded-full border border-border/60 bg-background/90 px-2.5 py-1 text-[10px] font-semibold text-primary">
                {badge}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 px-4 py-4">
          <div className="space-y-1">
            <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-foreground">
              {product.title}
            </h3>
            {subtitle ? (
              <p className="text-xs text-foreground/70">{subtitle}</p>
            ) : null}
            {variantPreview ? (
              <p className="text-xs text-foreground/65">
                <span className="font-semibold uppercase tracking-[0.12em] text-foreground/60">
                  {variantPreview.label}:
                </span>{" "}
                {variantPreview.values.join(", ")}
                {variantPreview.remaining > 0 ? ` +${variantPreview.remaining} more` : ""}
              </p>
            ) : null}
          </div>

          {price ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {(() => {
                const hasRange = price.minCalculated !== price.maxCalculated
                const minPriceLabel = convertToLocale({
                  amount: price.minCalculated,
                  currency_code: price.currencyCode,
                })
                const maxPriceLabel = convertToLocale({
                  amount: price.maxCalculated,
                  currency_code: price.currencyCode,
                })

                return (
                  <span className="font-semibold text-foreground" data-testid="product-price">
                    {hasRange ? `${minPriceLabel} - ${maxPriceLabel}` : minPriceLabel}
                  </span>
                )
              })()}
              {typeof price.cheapestOriginal === "number" &&
              price.minCalculated === price.maxCalculated &&
              price.cheapestOriginal > price.minCalculated ? (
                <span className="text-xs text-foreground/60 line-through">
                  {convertToLocale({
                    amount: price.cheapestOriginal,
                    currency_code: price.currencyCode,
                  })}
                </span>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-foreground/60">Pricing unavailable</p>
          )}

          <p className="mt-auto text-xs uppercase tracking-[0.23em] text-foreground/60">
            View details
          </p>
        </div>
      </article>
    </LocalizedClientLink>
  )
}
