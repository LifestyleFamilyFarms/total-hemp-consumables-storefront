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

  const src =
    format === "svg"
      ? selectedOutput.svg ?? selectedOutput.webp ?? selectedOutput.png
      : format === "png"
        ? selectedOutput.png ?? selectedOutput.webp ?? selectedOutput.svg
        : selectedOutput.webp ?? selectedOutput.png ?? selectedOutput.svg

  if (!src) {
    throw new Error(`Brand asset ${asset.id} is missing ${format.toUpperCase()} output`)
  }

  return (
    <figure className={cn("inline-flex flex-col items-center gap-2", className)}>
      <Image
        src={src}
        alt={config.label}
        width={selectedOutput.width ?? 0}
        height={selectedOutput.height ?? 0}
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
