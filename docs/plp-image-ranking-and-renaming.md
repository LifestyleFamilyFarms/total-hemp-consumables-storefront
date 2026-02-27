# PLP/PDP Image Ranking and Renaming Template

This document captures the current storefront image-selection logic and a naming convention that matches it.

## Source of truth in code

- PLP variant image ranking:
  - `src/modules/products/components/variant-preview/index.tsx:64`
  - `src/modules/products/components/variant-preview/index.tsx:90`
- PDP image ranking:
  - `src/modules/products/components/product-detail-client/index.tsx:231`
  - `src/modules/products/components/product-detail-client/index.tsx:454`
  - `src/modules/products/components/product-detail-client/index.tsx:495`

## Current ranking logic (exact behavior)

1. Images are first sorted by numeric `image.rank` when available.
2. If variant metadata includes exact filenames in:
   - `media_thumbnail_filename`
   - `media_variant_image_filenames`
   then those names are prioritized first by exact filename match.
3. If no metadata match exists, filename patterns are used:
   - Priority `0`: thumbnail image that is NOT a label image
   - Priority `1`: hero pattern match (`front|hero|main|primary|pack|bottle|product|angle`)
   - Priority `2`: secondary pattern match (`back|rear|side`)
   - Priority `3`: fallback/other
   - Priority `4`: label pattern match (`nute|nutrition|label|ingredient|supplement|facts`)
4. Ties are resolved lexicographically by filename.

Important: If a filename contains both `thumbnail` and label keywords (for example `thumbnail-label`), it is treated as label priority, not hero.

## Recommended filename standard

Use lowercase + hyphens only.

Format:

`{product-handle}--{variant-key}--{slot-token}--{seq}.webp`

Examples:

- `cbd-gummies--750mg-30ct--thumbnail-front--01.webp`
- `cbd-gummies--750mg-30ct--front--02.webp`
- `cbd-gummies--750mg-30ct--angle-left--03.webp`
- `cbd-gummies--750mg-30ct--back--04.webp`
- `cbd-gummies--750mg-30ct--label-facts--05.webp`

Notes:

- Always include one explicit hero token in the primary shot:
  - `thumbnail-front` (best)
  - or `front` / `hero` / `main` / `primary` / `pack` / `bottle` / `product` / `angle`
- Keep label assets separate and clearly labeled:
  - use `label`, `nutrition`, `ingredient`, `supplement`, or `facts`
- Use transparent `webp` for background-removed files.

## Slot token guide (aligned to regex)

- Hero group (priority 0/1): `thumbnail-front`, `front`, `hero`, `main`, `primary`, `pack`, `bottle`, `product`, `angle-left`, `angle-right`
- Secondary group (priority 2): `back`, `rear`, `side-left`, `side-right`
- Label group (priority 4): `label-facts`, `nutrition-facts`, `ingredient-panel`, `supplement-facts`

## Metadata mapping template

For each variant, set:

- `media_thumbnail_filename`: one file (usually `...--thumbnail-front--01.webp`)
- `media_variant_image_filenames`: ordered list for that variant

Suggested ordered list:

1. `thumbnail-front`
2. `front` or `hero`
3. `angle-left` / `angle-right`
4. `side` / `back`
5. `label-facts` / `nutrition-facts`

## Programmatic run workflow

1. Remove image backgrounds and export transparent `webp`.
2. Rename files using the standard format above.
3. Populate the CSV template:
   - `docs/plp-image-rename-template.csv`
4. Use the CSV to:
   - rename files in bulk
   - set `media_thumbnail_filename`
   - set `media_variant_image_filenames` in variant metadata

