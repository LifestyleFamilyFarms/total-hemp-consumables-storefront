import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const primary = images?.[0]
  const secondary = images?.slice(1, 5) ?? []

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-border/60 bg-background/70 shadow-[0_28px_56px_rgba(15,23,42,0.2)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        {primary?.url ? (
          <Image
            src={primary.url}
            alt="Primary product image"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 40vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlaceholderImage size={24} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
      </div>

      {secondary.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {secondary.map((image, index) => (
            <div
              key={image.id ?? index}
              className="relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-background/70"
            >
              {image.url ? (
                <Image
                  src={image.url}
                  alt={`Product image ${index + 2}`}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 45vw, 200px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlaceholderImage size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default ImageGallery
