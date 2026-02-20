import Image from "next/image"

import { PlpVariantRecord } from "@lib/data/products"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const LABEL_IMAGE_PATTERN = /(nute|nutrition|label|ingredient|supplement|facts)/i
const HERO_IMAGE_PATTERN = /(front|hero|main|primary|pack|bottle|product|angle)/i
const SECONDARY_IMAGE_PATTERN = /(back|rear|side)/i

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

export default function VariantPreview({ record }: { record: PlpVariantRecord }) {
  const { product, variant, priceAmount, currencyCode } = record
  const image = resolveVariantPreviewImage(record)
  const optionSummary = getVariantOptionSummary(record)
  const variantTitle = variant.title?.trim()
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
      <article className="surface-panel flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 transition hover:-translate-y-1">
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
        </div>

        <div className="flex flex-1 flex-col gap-3 px-4 py-4">
          <div className="space-y-1">
            <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-foreground">
              {product.title}
            </h3>
            {variantTitle ? (
              <p className="text-xs text-foreground/75">{variantTitle}</p>
            ) : null}
            {optionSummary.length ? (
              <p className="line-clamp-2 text-xs text-foreground/65">{optionSummary.join(" • ")}</p>
            ) : null}
          </div>

          {priceLabel ? (
            <span className="text-sm font-semibold text-foreground" data-testid="variant-price">
              {priceLabel}
            </span>
          ) : (
            <span className="text-sm text-foreground/60">Pricing unavailable</span>
          )}

          <p className="mt-auto text-xs uppercase tracking-[0.23em] text-foreground/60">
            View offering
          </p>
        </div>
      </article>
    </LocalizedClientLink>
  )
}
