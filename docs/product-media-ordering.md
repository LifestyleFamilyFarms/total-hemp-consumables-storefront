# Product Media Ordering Guide

Updated: 2026-02-19

## Purpose
Define a repeatable workflow for controlling PDP image order so the primary image is intentional (product hero first, labels later).

## Storefront Behavior (Current)
PDP image selection uses this priority:
1. Variant metadata filenames (`media_thumbnail_filename`, `media_variant_image_filenames`).
2. Product gallery order (`rank`) as fallback.
3. Storefront heuristic fallback:
   - Front/hero images are prioritized.
   - Nutrition/label/ingredient images are pushed later.

Note:
- Even if metadata is imperfect, storefront fallback tries to avoid leading with labels.
- Best results still come from correct backend metadata + rank.

## Backend Fields To Set Per Variant
Use these variant metadata fields:
- `media_thumbnail_filename`
- `media_variant_image_filenames` (comma-separated list)

### Recommended pattern
- `media_thumbnail_filename`: set to the intended hero filename.
- `media_variant_image_filenames`: list all desired variant images in display order.

Example:
`hero_front.webp,hero_back.webp,lifestyle.webp,nutrition_label.webp`

## Product Gallery Rank (Fallback Order)
In Medusa product gallery/media, assign rank so fallback order matches intent:
1. Hero/front pack image
2. Secondary pack angles/back
3. Lifestyle/supporting images
4. Nutrition/label/ingredient images

## Catalog Ops Checklist
For each variant:
1. Confirm a true hero image exists (not a label panel).
2. Set `media_thumbnail_filename` to that hero filename.
3. Set `media_variant_image_filenames` in exact desired order.
4. Ensure filenames in metadata match uploaded media filenames exactly.
5. Set product gallery `rank` values to the same order as fallback.

## Troubleshooting
If a nutrition label still appears first:
1. Check whether `media_thumbnail_filename` points to a label file.
2. Check `media_variant_image_filenames` ordering.
3. Check product gallery `rank` ordering.
4. Revalidate storefront cache / restart local storefront session after metadata edits.

## Why This Matters
Image ordering is now a catalog-governance task, not just a frontend task. The storefront can protect against bad defaults, but predictable merchandising requires consistent metadata and ranking in Medusa.
