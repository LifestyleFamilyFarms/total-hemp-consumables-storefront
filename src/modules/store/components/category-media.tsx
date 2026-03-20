import Image from "next/image"
import Link from "next/link"

import type { CatalogCategoryMediaCard, CategoryImageContract } from "@lib/data/categories"

const getGalleryImages = (images: CategoryImageContract) => {
  const excluded = new Set([images.banner, images.thumbnail].filter(Boolean))
  return images.gallery.filter((url) => !excluded.has(url))
}

export const CategoryBanner = ({
  categoryName,
  banner,
}: {
  categoryName: string
  banner?: string | null
}) => {
  if (!banner) {
    return null
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border border-border/30 bg-card/60 shadow-[0_20px_48px_rgba(5,8,20,0.22)] sm:mb-8">
      <div className="relative aspect-[16/6] min-h-[180px] w-full sm:min-h-[220px]">
        <Image
          src={banner}
          alt={`${categoryName} banner`}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 1200px"
        />
      </div>
    </div>
  )
}

export const CategoryThumbnailGallery = ({
  images,
  categoryName,
}: {
  images?: CategoryImageContract | null
  categoryName: string
}) => {
  if (!images) {
    return null
  }

  const gallery = getGalleryImages(images)

  if (!images.thumbnail && !gallery.length) {
    return null
  }

  return (
    <section className="bg-card border border-border/30 space-y-4 rounded-xl p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/60">
        Category media
      </p>

      {images.thumbnail ? (
        <div className="overflow-hidden rounded-2xl border border-border/30 bg-card/70">
          <div className="relative aspect-square">
            <Image
              src={images.thumbnail}
              alt={`${categoryName} thumbnail`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 220px, 280px"
            />
          </div>
        </div>
      ) : null}

      {gallery.length ? (
        <div className="grid grid-cols-2 gap-3">
          {gallery.slice(0, 4).map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="relative aspect-square overflow-hidden rounded-xl border border-border/30 bg-card/70"
            >
              <Image
                src={image}
                alt={`${categoryName} gallery ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 45vw, 180px"
              />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export const CatalogCategoryThumbnails = ({
  countryCode,
  categories,
}: {
  countryCode: string
  categories?: CatalogCategoryMediaCard[]
}) => {
  if (!categories?.length) {
    return null
  }

  return (
    <section className="bg-card border border-border/30 mb-6 space-y-4 rounded-xl p-4 sm:mb-8 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/60">
          Explore categories
        </p>
        <Link
          href={`/${countryCode}/store`}
          className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70 transition-colors hover:text-foreground"
        >
          Full catalog
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/${countryCode}/categories/${category.handle}`}
            className="group overflow-hidden rounded-2xl border border-border/30 bg-card/70 transition-colors hover:border-foreground/35"
          >
            <div className="relative aspect-[4/3] w-full">
              {category.thumbnail ? (
                <Image
                  src={category.thumbnail}
                  alt={`${category.name} thumbnail`}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 45vw, 260px"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted/35 px-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-foreground/55">
                  {category.name}
                </div>
              )}
            </div>
            <div className="px-3 py-2">
              <p className="line-clamp-1 text-sm font-semibold text-foreground">{category.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
