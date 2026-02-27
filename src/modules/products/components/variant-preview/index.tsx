import Image from "next/image"

import { PlpVariantRecord } from "@lib/data/products"
import { cn } from "@lib/utils"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  DEFAULT_PLP_CARD_STYLE,
  ResolvedPlpCardStyle,
} from "@modules/store/lib/card-style"

const LABEL_IMAGE_PATTERN = /(nute|nutrition|label|ingredient|supplement|facts)/i
const HERO_IMAGE_PATTERN = /(front|hero|main|primary|pack|bottle|product|angle)/i
const SECONDARY_IMAGE_PATTERN = /(back|rear|side)/i
const STRENGTH_LABEL_PATTERN = /(strength|potency|dose|dosage|mg|milligram)/i

function normalizeStringList(input: unknown): string[] {
  if (!input) {
    return []
  }

  if (Array.isArray(input)) {
    return input
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
  }

  if (typeof input === "string") {
    return input
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function extractFileName(value: string) {
  if (!value) {
    return ""
  }

  try {
    const parsed = value.includes("://") ? new URL(value).pathname : value
    return parsed.split("/").pop()?.toLowerCase() || ""
  } catch {
    return value.split("/").pop()?.toLowerCase() || ""
  }
}

function sortImagesByRank(images: NonNullable<PlpVariantRecord["product"]["images"]>) {
  return [...images].sort((left, right) => {
    const leftRank = typeof left.rank === "number" ? left.rank : Number.MAX_SAFE_INTEGER
    const rightRank = typeof right.rank === "number" ? right.rank : Number.MAX_SAFE_INTEGER

    if (leftRank !== rightRank) {
      return leftRank - rightRank
    }

    return (left.url || "").localeCompare(right.url || "")
  })
}

function getImagePriority(fileName: string, isThumbnail: boolean) {
  const isLabelImage = LABEL_IMAGE_PATTERN.test(fileName)

  if (isThumbnail && !isLabelImage) {
    return 0
  }

  if (HERO_IMAGE_PATTERN.test(fileName)) {
    return 1
  }

  if (SECONDARY_IMAGE_PATTERN.test(fileName)) {
    return 2
  }

  if (isLabelImage) {
    return 4
  }

  if (isThumbnail) {
    return 3
  }

  return 3
}

function resolveVariantPreviewImage(record: PlpVariantRecord) {
  const images = sortImagesByRank(record.product.images || [])
  if (!images.length) {
    return record.product.thumbnail || null
  }

  const thumbnailFileName = normalizeStringList(
    record.variant.metadata?.media_thumbnail_filename
  )
    .map(extractFileName)
    .find(Boolean)

  const prioritizedNames = Array.from(
    new Set(
      [
        ...(thumbnailFileName ? [thumbnailFileName] : []),
        ...normalizeStringList(record.variant.metadata?.media_variant_image_filenames)
          .map(extractFileName)
          .filter(Boolean),
      ].filter(Boolean)
    )
  )

  if (prioritizedNames.length) {
    const byFileName = new Map<string, (typeof images)[number]>()
    for (const image of images) {
      const fileName = extractFileName(image.url || "")
      if (fileName) {
        byFileName.set(fileName, image)
      }
    }

    for (const name of prioritizedNames) {
      const matched = byFileName.get(name)
      if (matched?.url) {
        return matched.url
      }
    }
  }

  const ranked = [...images].sort((left, right) => {
    const leftName = extractFileName(left.url || "")
    const rightName = extractFileName(right.url || "")
    const leftPriority = getImagePriority(leftName, leftName === thumbnailFileName)
    const rightPriority = getImagePriority(rightName, rightName === thumbnailFileName)

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority
    }

    return leftName.localeCompare(rightName)
  })

  return ranked[0]?.url || record.product.thumbnail || null
}

const getOptionTitleById = (record: PlpVariantRecord) =>
  new Map((record.product.options || []).map((option) => [option.id, option.title || "Option"]))

const getVariantOptionSummary = (record: PlpVariantRecord) => {
  const optionTitleById = getOptionTitleById(record)

  return (record.variant.options || [])
    .filter((option) => option.value)
    .map((option) => {
      const label = optionTitleById.get(option.option_id || "") || "Option"
      return `${label}: ${option.value}`
    })
}

const getStrengthSummary = (record: PlpVariantRecord) => {
  const optionTitleById = getOptionTitleById(record)

  for (const option of record.variant.options || []) {
    const label = optionTitleById.get(option.option_id || "") || "Option"
    if (option.value && STRENGTH_LABEL_PATTERN.test(label)) {
      return option.value
    }
  }

  const titleMatch = record.variant.title?.match(/\b\d+(\.\d+)?\s?(mg|mcg|g|ml)\b/i)
  return titleMatch?.[0] || null
}

export default function VariantPreview({
  record,
  cardStyle = DEFAULT_PLP_CARD_STYLE,
  styleLabel,
}: {
  record: PlpVariantRecord
  cardStyle?: ResolvedPlpCardStyle
  styleLabel?: string
}) {
  const { product, variant, priceAmount, currencyCode } = record
  const image = resolveVariantPreviewImage(record)
  const optionSummary = getVariantOptionSummary(record)
  const variantTitle = variant.title?.trim()
  const strengthSummary = getStrengthSummary(record)
  const detailSummary = optionSummary.filter((entry) => !STRENGTH_LABEL_PATTERN.test(entry)).join(" • ")
  const priceLabel =
    typeof priceAmount === "number" && currencyCode
      ? convertToLocale({
          amount: priceAmount,
          currency_code: currencyCode,
        })
      : null

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}?variant=${variant.id}`}
      className="group block h-full"
    >
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
            {variantTitle ? (
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/72">
                {variantTitle}
              </p>
            ) : null}

            {strengthSummary ? (
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/78">
                Strength: <span className="normal-case tracking-normal">{strengthSummary}</span>
              </p>
            ) : null}

            {detailSummary ? (
              <div className="rounded-xl border border-border/55 bg-background/55 px-2.5 py-2 text-[11px] text-foreground/68">
                {detailSummary}
              </div>
            ) : null}
          </div>

          <div className="mt-auto space-y-2">
            {priceLabel ? (
              <span className="plp-card__price mt-1 text-lg font-semibold text-foreground" data-testid="variant-price">
                {priceLabel}
              </span>
            ) : (
              <span className="text-sm text-foreground/60">Pricing unavailable</span>
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
