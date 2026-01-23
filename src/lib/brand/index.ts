import brandManifest from "./brand-assets.json"

export type BrandAsset = (typeof brandManifest.assets)[number]
export type BrandAssetId = BrandAsset["id"]
export type BrandAssetSizeLabel = keyof BrandAsset["outputs"]
export type BrandThemeId = "sativa" | "indica" | "light" | "dark"
export type BrandLogoSlot = "hero" | "nav" | "footer" | "compliance"

const brandAssetsById = brandManifest.assets.reduce<Record<BrandAssetId, BrandAsset>>((acc, asset) => {
  acc[asset.id] = asset
  return acc
}, {} as Record<BrandAssetId, BrandAsset>)

export const brandAssets = brandManifest.assets
export const brandManifestMeta = {
  generatedAt: brandManifest.generatedAt,
  sizes: brandManifest.sizes,
  sourceDir: brandManifest.sourceDir,
  outputDir: brandManifest.outputDir,
}

type BrandVariantConfig = {
  id: BrandAssetId
  label: string
  description: string
  recommendedUsage: string[]
  minWidthPx: number
  background: "light" | "dark" | "either"
}

export const BRAND_VARIANT_CONFIG = {
  heroWordmark: {
    id: "colorhorizontal-full-color-logo-nobgweb",
    label: "Hero wordmark",
    description: "Full-color horizontal mark for hero units, landing headlines, and page titles.",
    recommendedUsage: ["Hero banner", "Desktop navigation", "Marketing pages"],
    minWidthPx: 220,
    background: "either",
  },
  heroWordmarkGrey: {
    id: "grey-horizontal-full-color-logo-nobgweb",
    label: "Hero wordmark – greyscale",
    description: "Neutral greyscale version for light/white backgrounds.",
    recommendedUsage: ["Light theme hero", "Greyscale sections"],
    minWidthPx: 220,
    background: "light",
  },
  heroWordmarkBW: {
    id: "bw-horizontal-full-color-logo-nobgweb",
    label: "Hero wordmark – B&W",
    description: "High-contrast B&W horizontal mark for dark or compliance themes.",
    recommendedUsage: ["Dark theme hero", "Monochrome layouts"],
    minWidthPx: 220,
    background: "either",
  },
  navMonogram: {
    id: "full-color-icon-nobgweb",
    label: "Navigation monogram",
    description: "Compact icon lockup for cramped spaces like nav rails, avatars, or badges.",
    recommendedUsage: ["Topbar logo", "Sidebar toggle", "Favicons / avatar chips"],
    minWidthPx: 64,
    background: "either",
  },
  navMonogramDb: {
    id: "db-full-color-icon-nobgweb",
    label: "Navigation monogram – DB",
    description: "Full-color icon tuned for the Indica/DB palette.",
    recommendedUsage: ["Indica theme nav", "Dark cards"],
    minWidthPx: 64,
    background: "dark",
  },
  navMonogramBw: {
    id: "bw-icon-nobgweb",
    label: "Navigation monogram – B&W",
    description: "Black and white icon for true monochrome themes.",
    recommendedUsage: ["B&W theme nav", "Print contexts"],
    minWidthPx: 64,
    background: "either",
  },
  footerStack: {
    id: "full-color-logowtaglinenobgweb",
    label: "Stacked badge + tagline",
    description: "Primary badge with tagline for footer blocks, CTAs, or card headers.",
    recommendedUsage: ["Site footer", "Call-to-action cards", "Email templates"],
    minWidthPx: 180,
    background: "either",
  },
  footerStackGrey: {
    id: "grey-logowtagline-nobgweb",
    label: "Stacked badge – greyscale",
    description: "Greyscale badge for light theme footers and CTAs.",
    recommendedUsage: ["Light theme footer", "Greyscale cards"],
    minWidthPx: 180,
    background: "light",
  },
  footerStackDb: {
    id: "db-full-color-logowtagline-nobgweb",
    label: "Stacked badge – DB",
    description: "Deep-tone badge aligned to the Indica palette.",
    recommendedUsage: ["Indica theme footer", "Dark call-outs"],
    minWidthPx: 180,
    background: "dark",
  },
  darkBlockBadge: {
    id: "db-full-color-logo-nobgweb",
    label: "Dark block badge",
    description: "Version tuned for dark or highly saturated backgrounds with extra contrast baked in.",
    recommendedUsage: ["Dark hero sections", "Card overlays", "Modal backgrounds"],
    minWidthPx: 200,
    background: "dark",
  },
  complianceSeal: {
    id: "bw-logowtagline-wbgweb",
    label: "Compliance seal",
    description: "High-contrast black & white badge with tagline on a neutral background for legal content.",
    recommendedUsage: ["Compliance pages", "COA callouts", "Print-friendly layouts"],
    minWidthPx: 160,
    background: "light",
  },
  complianceGrey: {
    id: "grey-logowtagline-wbgweb",
    label: "Compliance seal – greyscale",
    description: "Greyscale badge with light backing for neutral/light layouts.",
    recommendedUsage: ["Light theme compliance blocks"],
    minWidthPx: 160,
    background: "light",
  },
  complianceDb: {
    id: "db-full-color-logowtagline-wbgweb",
    label: "Compliance seal – DB",
    description: "Indica palette badge with light backing for dark sections.",
    recommendedUsage: ["Indica compliance blocks"],
    minWidthPx: 160,
    background: "dark",
  },
  indicaNavHorizontal: {
    id: "db-colorhorizontal-full-color-logo-nobgweb",
    label: "Indica horizontal wordmark",
    description: "Horizontal full-color wordmark for Indica palette surfaces.",
    recommendedUsage: ["Topbar", "Sidebar", "Nav rails"],
    minWidthPx: 220,
    background: "either",
  },
  monoIcon: {
    id: "grey-icon-nobgweb",
    label: "Mono icon",
    description: "Neutral-toned icon for embossed effects, borders, or secondary placements.",
    recommendedUsage: ["Dividers", "Stamp graphics", "Muted sections"],
    minWidthPx: 56,
    background: "either",
  },
} as const satisfies Record<string, BrandVariantConfig>

export type BrandLogoVariant = keyof typeof BRAND_VARIANT_CONFIG

export function getBrandAssetById(id: BrandAssetId) {
  const asset = brandAssetsById[id]
  if (!asset) {
    throw new Error(`Unknown brand asset id: ${id}`)
  }
  return asset
}

export function getBrandVariant(variant: BrandLogoVariant) {
  const config = BRAND_VARIANT_CONFIG[variant]
  const asset = getBrandAssetById(config.id)
  return { config, asset }
}

export function listBrandVariants() {
  return (Object.keys(BRAND_VARIANT_CONFIG) as BrandLogoVariant[]).map((key) => {
    const { config, asset } = getBrandVariant(key)
    return { key, config, asset }
  })
}

const THEME_LOGO_MAP: Record<BrandThemeId, Record<BrandLogoSlot, BrandLogoVariant>> = {
  sativa: {
    hero: "heroWordmark",
    nav: "navMonogram",
    footer: "footerStack",
    compliance: "complianceSeal",
  },
  indica: {
    hero: "indicaNavHorizontal",
    nav: "indicaNavHorizontal",
    footer: "footerStackDb",
    compliance: "complianceDb",
  },
  light: {
    hero: "heroWordmarkGrey",
    nav: "monoIcon",
    footer: "footerStackGrey",
    compliance: "complianceGrey",
  },
  dark: {
    hero: "heroWordmarkBW",
    nav: "navMonogramBw",
    footer: "complianceSeal",
    compliance: "complianceSeal",
  },
}

export function getLogoVariantForTheme(slot: BrandLogoSlot, theme: BrandThemeId): BrandLogoVariant {
  return THEME_LOGO_MAP[theme]?.[slot] ?? "heroWordmark"
}
