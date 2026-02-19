"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { addToCart } from "@lib/data/cart"
import { selectOpenCartDrawer, useStorefrontState } from "@lib/state"
import { cn } from "@lib/utils"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

type ProductDetailClientProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

type ProductFaq = {
  question: string
  answer: string
}

const LABEL_IMAGE_PATTERN = /(nute|nutrition|label|ingredient|supplement|facts)/i
const HERO_IMAGE_PATTERN = /(front|hero|main|primary|pack|bottle|product|angle)/i
const SECONDARY_IMAGE_PATTERN = /(back|rear|side)/i
const OPTION_VALUE_COLLATOR = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
})
const OPTION_TITLE_PRIORITY_RULES: Array<{ pattern: RegExp; priority: number }> = [
  { pattern: /(dose|dosage|strength|potency|mg|milligram|concentration)/i, priority: 0 },
  { pattern: /(count|ct|quantity|pack|pieces?)/i, priority: 1 },
  { pattern: /(flavor|flavour|strain|type|blend)/i, priority: 2 },
  { pattern: /(size|volume|ml|oz|weight)/i, priority: 3 },
]

const toOptionMap = (variant: HttpTypes.StoreProductVariant | undefined) => {
  return (variant?.options || []).reduce<Record<string, string>>((acc, option) => {
    if (option.option_id && option.value) {
      acc[option.option_id] = option.value
    }

    return acc
  }, {})
}

const isVariantInStock = (variant?: HttpTypes.StoreProductVariant) => {
  if (!variant) {
    return false
  }

  if (!variant.manage_inventory || variant.allow_backorder) {
    return true
  }

  if (typeof variant.inventory_quantity === "number") {
    return variant.inventory_quantity > 0
  }

  if (typeof variant.inventory_quantity === "string") {
    const parsed = Number(variant.inventory_quantity)
    return Number.isFinite(parsed) ? parsed > 0 : true
  }

  return true
}

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

function readMetadataText(input: unknown): string {
  if (typeof input === "string") {
    return input.trim()
  }

  if (typeof input === "number" || typeof input === "boolean") {
    return String(input)
  }

  return ""
}

function parseJsonArray(input: unknown): unknown[] {
  if (!input) {
    return []
  }

  if (Array.isArray(input)) {
    return input
  }

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  return []
}

function normalizeFaqs(metadata: HttpTypes.StoreProduct["metadata"]): ProductFaq[] {
  const directFaqs = parseJsonArray(metadata?.product_faqs)
  const jsonFaqs = parseJsonArray(metadata?.product_faqs__json)
  const source = directFaqs.length ? directFaqs : jsonFaqs

  return source
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null
      }

      const candidate = item as Record<string, unknown>
      const question =
        (typeof candidate.question === "string" && candidate.question) ||
        (typeof candidate.q === "string" && candidate.q) ||
        ""

      const answer =
        (typeof candidate.answer === "string" && candidate.answer) ||
        (typeof candidate.a === "string" && candidate.a) ||
        ""

      if (!question || !answer) {
        return null
      }

      return { question, answer }
    })
    .filter((faq): faq is ProductFaq => Boolean(faq))
}

function normalizeDetailList(variant: HttpTypes.StoreProductVariant | undefined): string[] {
  if (!variant?.metadata) {
    return []
  }

  const jsonList = parseJsonArray(variant.metadata.variant_product_details__json)
  const directList = Array.isArray(variant.metadata.variant_product_details)
    ? variant.metadata.variant_product_details
    : []

  const source = jsonList.length ? jsonList : directList

  return source
    .map((item) => {
      if (typeof item === "string") {
        return item.trim()
      }

      if (item && typeof item === "object") {
        const candidate = item as Record<string, unknown>
        const label =
          (typeof candidate.label === "string" && candidate.label) ||
          (typeof candidate.name === "string" && candidate.name) ||
          (typeof candidate.title === "string" && candidate.title) ||
          ""
        const value = typeof candidate.value === "string" ? candidate.value : ""

        if (label && value) {
          return `${label}: ${value}`
        }

        return label || value
      }

      return ""
    })
    .filter(Boolean)
}

function extractFileName(url: string) {
  try {
    return new URL(url).pathname.split("/").pop()?.toLowerCase() || ""
  } catch {
    return ""
  }
}

function sortImagesByRank(images: HttpTypes.StoreProductImage[]) {
  return [...images].sort((left, right) => {
    const leftRank = typeof left.rank === "number" ? left.rank : Number.MAX_SAFE_INTEGER
    const rightRank =
      typeof right.rank === "number" ? right.rank : Number.MAX_SAFE_INTEGER

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

function parseOptionNumber(value: string) {
  const match = value.match(/-?\d+(\.\d+)?/)
  if (!match) {
    return null
  }

  const parsed = Number.parseFloat(match[0])
  return Number.isFinite(parsed) ? parsed : null
}

function sortOptionValues(values: Array<{ value: string }>) {
  if (values.length < 2) {
    return values
  }

  const normalized = values.map((entry, index) => ({
    entry,
    index,
    number: parseOptionNumber(entry.value),
  }))

  const allNumeric = normalized.every((item) => item.number !== null)

  if (!allNumeric) {
    return values
  }

  return [...normalized]
    .sort((left, right) => {
      const numericDiff = (left.number as number) - (right.number as number)
      if (numericDiff !== 0) {
        return numericDiff
      }

      const lexicalDiff = OPTION_VALUE_COLLATOR.compare(
        left.entry.value,
        right.entry.value
      )
      if (lexicalDiff !== 0) {
        return lexicalDiff
      }

      return left.index - right.index
    })
    .map((item) => item.entry)
}

function parseSelectorRank(metadata: unknown): number | null {
  if (!metadata || typeof metadata !== "object") {
    return null
  }

  const candidate = metadata as Record<string, unknown>
  const rawRank = candidate.selector_rank ?? candidate.option_rank ?? candidate.rank

  if (typeof rawRank === "number" && Number.isFinite(rawRank)) {
    return rawRank
  }

  if (typeof rawRank === "string") {
    const parsed = Number.parseInt(rawRank, 10)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

function normalizeOptionKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
}

function joinWithAnd(values: string[]) {
  if (values.length === 0) {
    return ""
  }

  if (values.length === 1) {
    return values[0]
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`
  }

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`
}

function parseRankValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

function parseSelectorRankOverrides(
  metadata: HttpTypes.StoreProduct["metadata"]
) {
  const map = new Map<string, number>()

  const candidates = [
    metadata?.selector_rank_map,
    metadata?.option_selector_rank_map,
    metadata?.option_rank_map,
  ]

  for (const candidate of candidates) {
    let source: unknown = candidate

    if (typeof source === "string") {
      try {
        source = JSON.parse(source)
      } catch {
        continue
      }
    }

    if (!source || typeof source !== "object" || Array.isArray(source)) {
      continue
    }

    for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
      const normalizedKey = normalizeOptionKey(key)
      const rank = parseRankValue(value)

      if (!normalizedKey || rank === null) {
        continue
      }

      map.set(normalizedKey, rank)
    }
  }

  return map
}

function sortProductOptions(
  options: HttpTypes.StoreProductOption[],
  productMetadata: HttpTypes.StoreProduct["metadata"]
) {
  if (options.length < 2) {
    return options
  }

  const rankOverrides = parseSelectorRankOverrides(productMetadata)

  return [...options]
    .map((option, index) => {
      const optionMetadataRank = parseSelectorRank((option as { metadata?: unknown }).metadata)
      const overrideRank = rankOverrides.get(normalizeOptionKey(option.title || ""))
      const priorityMatch = OPTION_TITLE_PRIORITY_RULES.find((rule) =>
        rule.pattern.test(option.title || "")
      )

      return {
        option,
        index,
        metadataRank:
          optionMetadataRank ?? overrideRank ?? Number.MAX_SAFE_INTEGER,
        titlePriority: priorityMatch ? priorityMatch.priority : 10,
      }
    })
    .sort((left, right) => {
      if (left.metadataRank !== right.metadataRank) {
        return left.metadataRank - right.metadataRank
      }

      if (left.titlePriority !== right.titlePriority) {
        return left.titlePriority - right.titlePriority
      }

      const titleDiff = OPTION_VALUE_COLLATOR.compare(
        left.option.title || "",
        right.option.title || ""
      )
      if (titleDiff !== 0) {
        return titleDiff
      }

      return left.index - right.index
    })
    .map((entry) => entry.option)
}

function sortVariantImageSet(
  images: HttpTypes.StoreProductImage[],
  orderedImages: HttpTypes.StoreProductImage[],
  thumbnailFileName: string,
  metadataOrder: Map<string, number>
) {
  const orderedIndex = new Map<string, number>()

  orderedImages.forEach((image, index) => {
    orderedIndex.set(extractFileName(image.url || ""), index)
  })

  return [...images].sort((left, right) => {
    const leftName = extractFileName(left.url || "")
    const rightName = extractFileName(right.url || "")

    const leftScore = getImagePriority(leftName, leftName === thumbnailFileName)
    const rightScore = getImagePriority(rightName, rightName === thumbnailFileName)

    if (leftScore !== rightScore) {
      return leftScore - rightScore
    }

    const leftMetaRank = metadataOrder.get(leftName) ?? Number.MAX_SAFE_INTEGER
    const rightMetaRank = metadataOrder.get(rightName) ?? Number.MAX_SAFE_INTEGER

    if (leftMetaRank !== rightMetaRank) {
      return leftMetaRank - rightMetaRank
    }

    const leftRank = orderedIndex.get(leftName) ?? Number.MAX_SAFE_INTEGER
    const rightRank = orderedIndex.get(rightName) ?? Number.MAX_SAFE_INTEGER

    if (leftRank !== rightRank) {
      return leftRank - rightRank
    }

    return leftName.localeCompare(rightName)
  })
}

function resolveVariantImages(
  orderedImages: HttpTypes.StoreProductImage[],
  variant: HttpTypes.StoreProductVariant | undefined
) {
  if (!orderedImages.length) {
    return []
  }

  const thumbnailFileName = normalizeStringList(
    variant?.metadata?.media_thumbnail_filename
  )[0]?.toLowerCase()

  const variantFileNames = normalizeStringList(
    variant?.metadata?.media_variant_image_filenames
  ).map((item) => item.toLowerCase())

  const prioritizedNames = Array.from(
    new Set([...(thumbnailFileName ? [thumbnailFileName] : []), ...variantFileNames])
  )

  const metadataOrder = new Map<string, number>()
  prioritizedNames.forEach((name, index) => {
    metadataOrder.set(name, index)
  })

  if (prioritizedNames.length) {
    const lookup = new Map<string, HttpTypes.StoreProductImage>()
    orderedImages.forEach((image) => {
      const fileName = extractFileName(image.url || "")
      if (fileName) {
        lookup.set(fileName, image)
      }
    })

    const matched: HttpTypes.StoreProductImage[] = []
    const seen = new Set<string>()

    prioritizedNames.forEach((name) => {
      const image = lookup.get(name)
      if (!image || seen.has(name)) {
        return
      }

      seen.add(name)
      matched.push(image)
    })

    if (matched.length) {
      return sortVariantImageSet(
        matched,
        orderedImages,
        thumbnailFileName || "",
        metadataOrder
      )
    }
  }

  return sortVariantImageSet(
    orderedImages,
    orderedImages,
    thumbnailFileName || "",
    metadataOrder
  )
}

export default function ProductDetailClient({
  product,
  countryCode,
}: ProductDetailClientProps) {
  const router = useRouter()
  const openCartDrawer = useStorefrontState(selectOpenCartDrawer)
  const [isAdding, setIsAdding] = useState(false)

  const variants = useMemo(() => product.variants || [], [product.variants])
  const defaultVariant = useMemo(
    () => variants.find((variant) => isVariantInStock(variant)) || variants[0],
    [variants]
  )
  const orderedOptions = useMemo(
    () => sortProductOptions(product.options || [], product.metadata),
    [product.options, product.metadata]
  )

  const initialOptions = useMemo(() => {
    const base = orderedOptions.reduce<Record<string, string>>((acc, option) => {
      acc[option.id] = ""
      return acc
    }, {})

    if (variants.length === 1 && defaultVariant) {
      return {
        ...base,
        ...toOptionMap(defaultVariant),
      }
    }

    return base
  }, [defaultVariant, orderedOptions, variants.length])

  const [options, setOptions] = useState<Record<string, string>>(initialOptions)

  useEffect(() => {
    setOptions(initialOptions)
  }, [initialOptions])

  const selectedOptionEntries = useMemo(
    () => Object.entries(options).filter(([, value]) => Boolean(value)),
    [options]
  )

  const isSelectionComplete = useMemo(
    () =>
      orderedOptions.length > 0 &&
      orderedOptions.every((option) => Boolean(options[option.id])),
    [options, orderedOptions]
  )

  const matchingVariants = useMemo(() => {
    if (!variants.length) {
      return []
    }

    return variants.filter((variant) => {
      const variantOptions = toOptionMap(variant)
      return selectedOptionEntries.every(([key, value]) => variantOptions[key] === value)
    })
  }, [selectedOptionEntries, variants])

  const selectedVariant = useMemo(() => {
    if (!isSelectionComplete) {
      return undefined
    }

    return (
      matchingVariants.find((variant) => {
        const variantOptions = toOptionMap(variant)
        return orderedOptions.every(
          (option) => variantOptions[option.id] === options[option.id]
        )
      }) || matchingVariants[0]
    )
  }, [isSelectionComplete, matchingVariants, options, orderedOptions])

  const previewVariant = useMemo(
    () =>
      matchingVariants.find((variant) => isVariantInStock(variant)) ||
      matchingVariants[0] ||
      defaultVariant,
    [defaultVariant, matchingVariants]
  )

  const availableValuesByOption = useMemo(() => {
    const map = new Map<string, Set<string>>()

    for (const option of orderedOptions) {
      map.set(option.id, new Set<string>())
    }

    for (const variant of variants) {
      if (!isVariantInStock(variant)) {
        continue
      }

      const variantOptions = toOptionMap(variant)

      for (const [index, option] of orderedOptions.entries()) {
        const optionId = option.id
        const candidateValue = variantOptions[optionId]

        if (!candidateValue) {
          continue
        }

        const matchesParentSelections = orderedOptions
          .slice(0, index)
          .every((parentOption) => {
            const selectedParentValue = options[parentOption.id]
            if (!selectedParentValue) {
              return true
            }

            return variantOptions[parentOption.id] === selectedParentValue
          })

        if (matchesParentSelections) {
          map.get(optionId)?.add(candidateValue)
        }
      }
    }

    return map
  }, [options, orderedOptions, variants])

  useEffect(() => {
    setOptions((current) => {
      let changed = false
      const next = { ...current }

      for (const [index, option] of orderedOptions.entries()) {
        const unmetParent = orderedOptions
          .slice(0, index)
          .find((parentOption) => !next[parentOption.id])

        if (unmetParent) {
          if (next[option.id]) {
            next[option.id] = ""
            changed = true
          }
          continue
        }

        const availableValues = availableValuesByOption.get(option.id) || new Set<string>()
        const selectedValue = next[option.id]

        if (selectedValue && !availableValues.has(selectedValue)) {
          next[option.id] = ""
          changed = true
          continue
        }

        if (!selectedValue && availableValues.size === 1) {
          next[option.id] = Array.from(availableValues)[0]
          changed = true
        }
      }

      return changed ? next : current
    })
  }, [availableValuesByOption, orderedOptions])

  const activeVariant = previewVariant
  const orderedImages = useMemo(() => sortImagesByRank(product.images || []), [product.images])
  const variantImages = useMemo(
    () => resolveVariantImages(orderedImages, activeVariant),
    [activeVariant, orderedImages]
  )

  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    setActiveImageIndex(0)
  }, [activeVariant?.id])

  const activeImage = variantImages[activeImageIndex] || variantImages[0]
  const inStock = isVariantInStock(selectedVariant)

  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: selectedVariant?.id,
  })

  const selectedPrice = selectedVariant ? variantPrice : cheapestPrice
  const ingredientsText = readMetadataText(
    activeVariant?.metadata?.variant_ingredients ?? product.metadata?.ingredients
  )
  const detailList = normalizeDetailList(activeVariant)
  const faqs = normalizeFaqs(product.metadata)
  const description =
    readMetadataText(activeVariant?.metadata?.variant_description) ||
    product.description ||
    "Product details are coming soon."
  const missingOptionTitles = useMemo(
    () =>
      orderedOptions
        .filter((option) => !options[option.id])
        .map((option) => option.title || "option"),
    [options, orderedOptions]
  )
  const shouldPromptDetailsSelection =
    variants.length > 1 && !selectedVariant && matchingVariants.length > 1
  const detailsSelectionTargets = joinWithAnd(missingOptionTitles) || "the remaining options"
  const detailsSelectionPrompt = `Please select ${detailsSelectionTargets} to display product details.`

  const addToCartEnabled = Boolean(selectedVariant?.id && inStock && !isAdding)

  const addButtonLabel = !selectedVariant
    ? variants.length > 1
      ? "Select options"
      : "Unavailable"
    : !inStock
      ? "Out of stock"
      : isAdding
        ? "Adding"
        : "Add to cart"

  const handleOptionChange = (optionId: string, value: string) => {
    setOptions((current) => {
      const next = {
        ...current,
        [optionId]: value,
      }

      const changedIndex = orderedOptions.findIndex((option) => option.id === optionId)

      if (changedIndex >= 0) {
        for (const downstreamOption of orderedOptions.slice(changedIndex + 1)) {
          next[downstreamOption.id] = ""
        }
      }

      return next
    })
  }

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) {
      toast.error("Select all variant options before adding to cart.")
      return
    }

    setIsAdding(true)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
      })

      router.refresh()
      openCartDrawer()
      toast.success("Added to cart")
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to add to cart.")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.85fr)_minmax(0,0.85fr)] xl:items-start xl:gap-6">
        <div className="space-y-3">
          <div className="relative aspect-[5/6] overflow-hidden rounded-3xl border border-border/60 bg-card/60">
            {activeImage?.url ? (
              <Image
                src={activeImage.url}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover object-center"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-foreground/60">
                No product image
              </div>
            )}
          </div>

          {variantImages.length > 1 ? (
            <div className="grid grid-cols-4 gap-2">
              {variantImages.slice(0, 8).map((image, index) => (
                <button
                  key={image.id || `${image.url}-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-xl border bg-background/60 transition",
                    index === activeImageIndex
                      ? "border-primary"
                      : "border-border/60 hover:border-primary/50"
                  )}
                >
                  {image.url ? (
                    <Image
                      src={image.url}
                      alt={`${product.title} thumbnail ${index + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover object-center"
                    />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-5 rounded-3xl border border-border/60 bg-card/70 p-5 sm:p-6">
          <div className="space-y-2">
            <h1
              className="text-3xl font-semibold tracking-tight text-foreground"
              data-testid="product-title"
            >
              {product.title}
            </h1>
            <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">
              {activeVariant?.title || "Choose a variant"}
            </p>
          </div>

          {selectedPrice ? (
            <div className="space-y-1">
              <p className="text-3xl font-semibold text-foreground" data-testid="product-price">
                {!selectedVariant && variants.length > 1 ? "From " : ""}
                {selectedPrice.calculated_price}
              </p>
              {selectedPrice.price_type === "sale" ? (
                <p
                  className="text-sm text-foreground/60 line-through"
                  data-testid="original-product-price"
                >
                  {selectedPrice.original_price}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-foreground/60">Pricing unavailable</p>
          )}

          <p className="text-sm leading-relaxed text-foreground/75">{description}</p>

          <div className="space-y-4">
            {orderedOptions.map((option) => {
              const values = sortOptionValues([...(option.values || [])])
              const availableValues = availableValuesByOption.get(option.id) || new Set<string>()
              const optionIndex = orderedOptions.findIndex((entry) => entry.id === option.id)
              const unmetParent = orderedOptions
                .slice(0, optionIndex)
                .find((parentOption) => !options[parentOption.id])
              const hasRequiredParentSelections = !unmetParent
              const parentPrompt = unmetParent?.title || "required option"
              const optionPrompt = option.title?.toLowerCase() || "option"
              const selectPlaceholder = hasRequiredParentSelections
                ? `Select ${optionPrompt}`
                : `Select ${parentPrompt}`
              const visibleValues =
                hasRequiredParentSelections && availableValues.size > 0
                  ? values.filter((valueOption) => availableValues.has(valueOption.value))
                  : []
              const selectedValue = options[option.id] || ""

              return (
                <div
                  key={option.id}
                  className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/60 sm:pt-1">
                    {option.title}
                  </p>

                  <div data-testid="product-options">
                    <Select
                      value={selectedValue}
                      onValueChange={(value) => handleOptionChange(option.id, value)}
                      disabled={isAdding || !hasRequiredParentSelections || visibleValues.length === 0}
                    >
                      <SelectTrigger
                        className="h-11 w-full"
                        aria-label={option.title}
                        data-testid="option-select"
                      >
                        <SelectValue placeholder={selectPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {visibleValues.map((valueOption) => {
                          const value = valueOption.value

                          return (
                            <SelectItem
                              key={valueOption.id || `${option.id}-${value}`}
                              value={value}
                            >
                              {value}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    {!hasRequiredParentSelections && unmetParent ? (
                      <p className="mt-2 text-xs text-foreground/60">
                        Select {unmetParent.title} first.
                      </p>
                    ) : null}
                    {hasRequiredParentSelections && visibleValues.length === 0 ? (
                      <p className="mt-2 text-xs text-foreground/60">
                        No {option.title.toLowerCase()} values available for the current selection.
                      </p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-2">
            <p
              className={cn(
                "text-sm font-medium",
                inStock ? "text-emerald-700" : "text-accent"
              )}
            >
              {selectedVariant
                ? inStock
                  ? "In stock"
                  : "Out of stock"
                : "Select options to check availability"}
            </p>
            <Button
              onClick={handleAddToCart}
              disabled={!addToCartEnabled}
              className="h-11 w-full"
              data-testid="add-product-button"
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                addButtonLabel
              )}
            </Button>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/60 px-4 py-3 text-xs uppercase tracking-[0.22em] text-foreground/60">
            21+ only. Farm Bill compliant hemp products.
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/60 xl:mt-0">
          <Accordion
            type="multiple"
            defaultValue={["details", "faqs"]}
            className="rounded-2xl"
          >
            <AccordionItem value="details">
              <AccordionTrigger className="px-5 text-left text-base font-semibold">
                Product Details
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                {shouldPromptDetailsSelection ? (
                  <p className="text-sm text-foreground/70">{detailsSelectionPrompt}</p>
                ) : detailList.length ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
                    {detailList.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-foreground/70">
                    No additional details for this variant.
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faqs">
              <AccordionTrigger className="px-5 text-left text-base font-semibold">
                FAQs
              </AccordionTrigger>
              <AccordionContent className="space-y-3 px-5 pb-5">
                {faqs.length ? (
                  <Accordion type="single" collapsible className="rounded-xl border border-border/50 bg-card/70">
                    {faqs.map((faq, index) => (
                      <AccordionItem
                        key={`${faq.question}-${index}`}
                        value={`faq-${index}`}
                        className="border-border/40 px-3"
                      >
                        <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 text-sm text-foreground/75">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-sm text-foreground/70">
                    FAQ data is not available for this product.
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ingredients">
              <AccordionTrigger className="px-5 text-left text-base font-semibold">
                Ingredients
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 text-sm leading-relaxed text-foreground/80">
                {ingredientsText ? (
                  <p className="whitespace-pre-line">{ingredientsText}</p>
                ) : (
                  <p className="text-foreground/70">
                    Ingredient details are not provided for this variant.
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  )
}
