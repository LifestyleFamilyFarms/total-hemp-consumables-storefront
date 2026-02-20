import Image from "next/image"
import { cn } from "@lib/utils"

type BrandSpinnerProps = {
  className?: string
}

export function BrandSpinner({ className }: BrandSpinnerProps) {
  return (
    <Image
      src="/logos/optimized/FULL_COLOR_ICON_NObgWEB/md.webp"
      alt=""
      aria-hidden
      width={16}
      height={16}
      className={cn("h-4 w-4 motion-safe:animate-spin", className)}
    />
  )
}

