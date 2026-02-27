import Image from "next/image"

import { HttpTypes } from "@medusajs/types"
import { cn } from "@lib/utils"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { subtitleForProduct } from "@lib/mappers/product-labels"
import { convertToLocale } from "@lib/util/money"
import {
  DEFAULT_PLP_CARD_STYLE,
  ResolvedPlpCardStyle,
} from "@modules/store/lib/card-style"

const BADGES: Record<string, string> = {
  sativa: "Sativa",
  indica: "Indica",
  hybrid: "Hybrid",
}
const MAX_TAG_PILLS = 2
const EXCLUDED_TAG_PILLS = new Set([
  "proleve",
  "barney's botanicals",
  "barneys botanicals",
])

const STRENGTH_LABEL_PATTERN = /(strength|potency|dose|dosage|mg|milligram)/i
const STRENGTH_VALUE_PATTERN = /\b\d+(\.\d+)?\s?(mg|mcg|g|ml)\b/i

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
        original: number | null | undefined
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

function getStrengthSummary({
  variantPreview,
  tags,
}: {
  variantPreview: ReturnType<typeof getVariantPreview>
  tags: HttpTypes.StoreProduct["tags"]
}) {
  if (variantPreview && STRENGTH_LABEL_PATTERN.test(variantPreview.label)) {
    const base = variantPreview.values.join(", ")
    return variantPreview.remaining > 0 ? `${base} +${variantPreview.remaining} more` : base
  }

  const tagStrength = (tags || [])
    .map((tag) => tag.value?.trim())
    .filter((value): value is string => Boolean(value))
    .find((value) => STRENGTH_VALUE_PATTERN.test(value))

  return tagStrength || null
}

function getVariantDetailSummary(variantPreview: ReturnType<typeof getVariantPreview>) {
  if (!variantPreview || STRENGTH_LABEL_PATTERN.test(variantPreview.label)) {
    return null
  }

  const base = variantPreview.values.join(", ")
  return `${variantPreview.label}: ${base}${
    variantPreview.remaining > 0 ? ` +${variantPreview.remaining} more` : ""
  }`
}

export default function ProductPreview({
  product,
  cardStyle = DEFAULT_PLP_CARD_STYLE,
  styleLabel,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  cardStyle?: ResolvedPlpCardStyle
  styleLabel?: string
}) {
  const badge = getBadge(product)
  const subtitle = subtitleForProduct(product)
  const image = product.thumbnail || product.images?.[0]?.url || null
  const price = getPriceSummary(product)
  const tagPills = getTagPills(product, badge)
  const variantPreview = getVariantPreview(product)
  const strengthSummary = getStrengthSummary({
    variantPreview,
    tags: product.tags,
  })
  const variantDetailSummary = getVariantDetailSummary(variantPreview)

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block h-full">
      <article className={cn("surface-panel plp-card", `plp-card--${cardStyle}`)}>
        <div className="plp-card__media">
          {image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              className="plp-card__image"
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/70 text-muted-foreground">
              No image
            </div>
          )}

          <div className="plp-card__media-vignette" />
          <div className="plp-card__media-glass" />
          <div className="plp-card__media-glow" />

          <div className="absolute left-3 top-3 flex max-w-[80%] flex-wrap items-center gap-1.5">
            {tagPills.map((tag) => (
              <span
                key={tag}
                className="surface-button rounded-full px-2.5 py-1 text-[10px] font-semibold text-foreground/85"
              >
                {tag}
              </span>
            ))}
            {badge ? (
              <span className="surface-button rounded-full px-2.5 py-1 text-[10px] font-semibold text-primary">
                {badge}
              </span>
            ) : null}
          </div>
          {styleLabel ? (
            <span className="absolute right-3 top-3 rounded-full border border-border/60 bg-card/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground/78">
              {styleLabel}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3">
          <div className="space-y-2">
            <h3 className="plp-card__title line-clamp-2 text-[1.02rem] font-semibold tracking-tight text-foreground">
              {product.title}
            </h3>

            {strengthSummary ? (
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/78">
                Strength: <span className="normal-case tracking-normal">{strengthSummary}</span>
              </p>
            ) : null}

            {subtitle ? (
              <p className="line-clamp-2 text-xs leading-relaxed text-foreground/72">{subtitle}</p>
            ) : null}

            {variantDetailSummary ? (
              <div className="rounded-xl border border-border/55 bg-background/55 px-2.5 py-2 text-[11px] text-foreground/68">
                {variantDetailSummary}
              </div>
            ) : null}
          </div>

          <div className="mt-auto space-y-2">
            {price ? (
              <div className="mt-1 flex items-end justify-between gap-3">
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
                    <span
                      className="plp-card__price text-lg font-semibold text-foreground"
                      data-testid="product-price"
                    >
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

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/62">
              View details
            </p>
          </div>
        </div>
      </article>
    </LocalizedClientLink>
  )
}
