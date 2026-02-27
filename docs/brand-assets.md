# Brand Asset Usage Guide

This guide explains how to work with the SVG-only logo/icon set generated from the designer package.

## Working with the source
- Original deliverables live in `assets/brand/LOGOS_ICONS_GUIDE` (AI/EPS/PDF).
- Source web logos live in `assets/brand/LOGOS_ICONS_WEB`.
- Runtime logo assets live in `public/logos/svg`.
- `yarn brand:build` is SVG-only and updates `src/lib/brand/brand-assets.json` with SVG paths + intrinsic dimensions.
- If the design team ships new files, drop them in `assets/brand/LOGOS_ICONS_WEB` and re-run `yarn brand:build`.

## Curated variants
The manifest contains every permutation of the logo set. For day-to-day work, stick to the curated keys below (wired up in `src/lib/brand/index.ts` and consumed by the `BrandLogo` component).

| Variant key | Source asset ID | Suggested use | Notes |
| --- | --- | --- | --- |
| `heroWordmark` | `colorhorizontal-full-color-logo-nobgweb` | Hero banner, marketing landing pages, desktop nav | Full-color horizontal lockup, minimum width ~220px. Works on light or dark backgrounds. |
| `navMonogram` | `full-color-icon-nobgweb` | Topbar icon, sidebar rail, chip/avatar | Compact circular icon. Comfortable down to 64px. |
| `footerStack` | `full-color-logowtaglinenobgweb` | Site footer, CTA cards, badges | Includes tagline; ideal width 180–260px. |
| `darkBlockBadge` | `db-full-color-logo-nobgweb` | Dark hero sections, overlays | Tuned for darker backgrounds with boosted contrast. |
| `complianceSeal` | `bw-logowtagline-wbgweb` | Compliance notices, COA callouts, PDF exports | Black/white version on neutral background for max legibility. |
| `monoIcon` | `grey-icon-nobgweb` | Watermarks, dividers, background stamps | Neutral mono icon for subtle treatments. |

If you need something outside this list (e.g., no-TM or GREY horizontal), import the manifest helpers from `@lib/brand` and pick the asset by ID so the rest of the app stays consistent.

## React helper
- `src/lib/brand/index.ts` exposes:
  - `getBrandVariant(variant)` – returns the curated config + manifest entry
  - `listBrandVariants()` – handy for docs or admin dashboards
  - `brandAssets` / `brandManifestMeta` – raw manifest data
- `src/components/brand/brand-logo.tsx` is the single place to render logos. It resolves SVG first and uses intrinsic dimensions from the manifest.

### Example
```tsx
import { BrandLogo } from "@/components/brand/brand-logo"

function FooterLogo() {
  return <BrandLogo variant="footerStack" priority withShadow />
}
```

## Animation + future polish
- Keep motion subtle (opacity fades, slight parallax) and implement it inside `BrandLogo` so all placements benefit.
- For bespoke hero animations, prefer SVG exports from the AI master so we can animate strokes/paths without quality loss.
