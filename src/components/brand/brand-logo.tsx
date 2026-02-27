import Image from "next/image"
import { cn } from "@lib/utils"
import {
  BrandAssetSizeLabel,
  BrandLogoSlot,
  BrandLogoVariant,
  BrandThemeId,
  getBrandVariant,
  getLogoVariantForTheme,
} from "@lib/brand"

type BrandLogoProps = {
  variant?: BrandLogoVariant
  theme?: BrandThemeId
  slot?: BrandLogoSlot
  size?: BrandAssetSizeLabel
  format?: "png" | "webp" | "svg"
  priority?: boolean
  className?: string
  showLabel?: boolean
  caption?: React.ReactNode
  withShadow?: boolean
}

export function BrandLogo({
  variant,
  theme,
  slot = "hero",
  size = "md",
  format = "svg",
  priority = false,
  className,
  showLabel = false,
  caption,
  withShadow = false,
}: BrandLogoProps) {
  const resolvedVariant = variant ?? (theme ? getLogoVariantForTheme(slot, theme) : "heroWordmark")
  const { config, asset } = getBrandVariant(resolvedVariant)
  const availableSizes = asset.outputs
  const selectedOutput =
    availableSizes[size] ?? availableSizes.orig ?? Object.values(availableSizes)[0]

  if (!selectedOutput) {
    throw new Error(`Brand asset ${asset.id} has no output for size ${size}`)
  }

  const normalizedOutput = selectedOutput as {
    width?: number
    height?: number
    svg?: string
    png?: string
    webp?: string
  }
  const svgSrc =
    typeof normalizedOutput.svg === "string" ? normalizedOutput.svg : null

  const src =
    format === "svg"
      ? svgSrc ?? normalizedOutput.webp ?? normalizedOutput.png
      : format === "png"
        ? normalizedOutput.png ?? normalizedOutput.webp ?? svgSrc
        : normalizedOutput.webp ?? normalizedOutput.png ?? svgSrc

  if (!src) {
    throw new Error(`Brand asset ${asset.id} is missing ${format.toUpperCase()} output`)
  }

  const normalizedSrc = src.startsWith("/") || src.startsWith("http") ? src : `/${src}`

  return (
    <figure className={cn("inline-flex flex-col items-center gap-2", className)}>
      <Image
        src={normalizedSrc}
        alt={config.label}
        width={normalizedOutput.width ?? 0}
        height={normalizedOutput.height ?? 0}
        priority={priority}
        className={cn(
          "h-auto w-full max-w-full object-contain",
          withShadow && "drop-shadow-[0_18px_28px_rgba(15,23,42,0.35)]"
        )}
        sizes="(max-width: 768px) 60vw, 320px"
      />
      {(showLabel || caption) && (
        <figcaption className="text-center text-xs text-foreground/70">
          {caption ?? config.label}
        </figcaption>
      )}
    </figure>
  )
}
