# Design Unification Sprint — Design Spec

**Date:** 2026-03-20
**Status:** Approved
**Scope:** Theme migration, PLP card redesign, PDP layout refactor, app shell integration, global cleanup, auth/checkout visual pass

---

## 1. Theme System: 4 → 3

### Decision
Kill Sativa theme. Keep Indica as default. Create Daylight (branded light) and Midnight (branded dark) by injecting brand DNA into the current generic Light/Dark themes.

### Indica (Default — One Change)
- Background: `137 55% 22%` (forest green)
- Foreground: `59 80% 82%` (butter)
- Card: `137 40% 18%`
- Primary: butter / Primary-foreground: forest
- Secondary: cocoa / Secondary-foreground: butter
- **Accent: `43 89% 60%` (gold)** — changed from tangelo (`20 79% 52%`) so all themes share gold as the CTA/accent color
- Accent-foreground: `137 55% 15%` (dark forest) — WCAG contrast ratio ~7.2:1 against gold, well above AA threshold
- Muted-foreground: gold
- Ring: gold

> **Breaking change from "unchanged":** Indica's `--accent` moves from tangelo to gold. This unifies the CTA button color across all three themes. Tangelo is preserved as `--brand-tangelo` on `:root` for any element that still needs it (e.g., sale badges, warning states).

### Daylight (Replaces Sativa + Light)
White/cream foundation with forest green primary and gold accent. Clean but unmistakably Total Hemp.

- Background: `60 20% 98%` (warm off-white)
- Foreground: `137 55% 22%` (forest green)
- Card: `60 15% 99%` (green-tinted white)
- Primary: `137 55% 22%` (forest) / Primary-foreground: `0 0% 100%`
- Secondary: `137 20% 94%` (green-gray) / Secondary-foreground: `137 55% 22%`
- Accent: `43 89% 60%` (gold) / Accent-foreground: `137 55% 15%`
- Muted: `137 15% 92%` / Muted-foreground: `137 30% 40%`
- Border: `137 20% 82%`
- Ring: `137 55% 22%`
- Destructive: `0 70% 50%` / Destructive-foreground: `0 0% 100%`

### Daylight Extended Tokens
Beyond the core palette above, Daylight needs these additional tokens (derived from the Indica token set):

**Sidebar:**
- `--sidebar-background: 60 15% 97%`
- `--sidebar-foreground: 137 55% 22%`
- `--sidebar-primary: 137 55% 22%` / `--sidebar-primary-foreground: 0 0% 100%`
- `--sidebar-accent: 43 89% 60%` / `--sidebar-accent-foreground: 137 55% 15%`
- `--sidebar-border: 137 20% 82%`
- `--sidebar-ring: 137 55% 22%`

**Input:** `--input: 137 20% 82%`

**Popover:** `--popover: 60 15% 99%` / `--popover-foreground: 137 55% 22%`

**Scene Gradients:** Use muted green/gold tones instead of the current pure gray. Values below are raw HSL channels — the `hsl()` wrapping and alpha are applied at the consumption site (e.g., `hsl(var(--scene-grad-tl) / 0.6)`), matching the existing codebase convention.
- `--scene-grad-tl: 137 15% 94%`
- `--scene-grad-tr: 43 30% 92%`
- `--scene-grad-bl: 137 20% 90%`
- `--scene-grad-br: 43 40% 88%`
- `--scene-grad-base-start: 60 20% 98%`
- `--scene-grad-base-end: 137 15% 96%`

**Surface Glass:** Light-mode glass treatment — subtle, barely visible. Raw HSL channels (same convention as scene gradients).
- `--surface-glass-top: 0 0% 100%`
- `--surface-glass-bottom: 137 10% 96%`
- `--surface-glass-glow: 43 89% 60%`
- `--surface-glass-edge: 0 0% 100%`
- `--surface-glass-shadow: 137 30% 20%`
- `--surface-border-*: 137 20% 82%` (all four corners + mid)

**Surface Lighting:**
- `--surface-light-angle: 156deg`
- `--surface-light-source-x: 12%`
- `--surface-light-source-y: 6%`

**Typography Shadow:** Minimal on light backgrounds.
- `--type-shadow-color: 137 30% 20%`
- `--type-shadow-opacity: 0.06`
- `--type-shadow-x: 0px`
- `--type-shadow-y: 1px`

**App Background:** Daylight intentionally uses a simplified single-color overlay instead of the multi-gradient overlay used by Indica. No background image or pattern — the clean off-white foundation carries the theme.
- `--app-bg-image: none`
- `--app-bg-pattern-opacity: 0`
- `--app-bg-filter: none`
- `--app-bg-overlay: hsl(137 15% 94% / 0.3)` (single flat tint, not the 5-layer gradient used by Indica)
- `--app-bg-overlay-opacity: 0.3`

### Midnight (Replaces Dark)
Near-black with forest green tints in the grays, gold accents. Total Hemp at night.

- Background: `137 20% 8%` (forest-tinted black)
- Foreground: `59 30% 92%` (warm off-white)
- Card: `137 18% 12%` (forest-tinted dark)
- Primary: `59 30% 92%` / Primary-foreground: `137 20% 8%`
- Secondary: `137 15% 18%` / Secondary-foreground: `59 30% 92%`
- Accent: `43 89% 60%` (gold) / Accent-foreground: `137 20% 8%` (near-black forest — darker than Indica/Daylight's `137 55% 15%` for stronger contrast on dark backgrounds)
- Muted: `137 12% 18%` / Muted-foreground: `137 20% 55%`
- Border: `137 15% 16%`
- Ring: `43 70% 55%`
- Destructive: `0 60% 45%` / Destructive-foreground: `59 30% 92%`

### Midnight Extended Tokens

**Sidebar:**
- `--sidebar-background: 137 18% 10%`
- `--sidebar-foreground: 59 30% 92%`
- `--sidebar-primary: 59 30% 92%` / `--sidebar-primary-foreground: 137 20% 8%`
- `--sidebar-accent: 43 89% 60%` / `--sidebar-accent-foreground: 137 20% 8%`
- `--sidebar-border: 137 15% 16%`
- `--sidebar-ring: 43 70% 55%`

**Input:** `--input: 137 15% 16%`

**Popover:** `--popover: 137 18% 12%` / `--popover-foreground: 59 30% 92%`

**Scene Gradients:** Deep forest/gold tones instead of pure gray. Raw HSL channels (same convention as Daylight above).
- `--scene-grad-tl: 137 25% 6%`
- `--scene-grad-tr: 43 40% 15%`
- `--scene-grad-bl: 137 30% 5%`
- `--scene-grad-br: 43 50% 12%`
- `--scene-grad-base-start: 137 20% 8%`
- `--scene-grad-base-end: 137 15% 6%`

**Surface Glass:** Dark-mode glass — more visible contrast. Raw HSL channels.
- `--surface-glass-top: 137 15% 18%`
- `--surface-glass-bottom: 137 20% 6%`
- `--surface-glass-glow: 43 89% 60%`
- `--surface-glass-edge: 59 30% 92%`
- `--surface-glass-shadow: 0 0% 0%`
- `--surface-border-*: 137 15% 16%` (all four corners + mid)

**Surface Lighting:**
- `--surface-light-angle: 156deg`
- `--surface-light-source-x: 12%`
- `--surface-light-source-y: 6%`

**Typography Shadow:** Subtle depth on dark backgrounds.
- `--type-shadow-color: 0 0% 0%`
- `--type-shadow-opacity: 0.3`
- `--type-shadow-x: 0px`
- `--type-shadow-y: 2px`

**App Background:** Midnight also uses a simplified single-color overlay (same rationale as Daylight above). Deep forest tint instead of multi-gradient.
- `--app-bg-image: none`
- `--app-bg-pattern-opacity: 0`
- `--app-bg-filter: none`
- `--app-bg-overlay: hsl(137 20% 4% / 0.5)` (single flat tint)
- `--app-bg-overlay-opacity: 0.5`

### Migration Steps
1. Move brand color variables (`--brand-forest`, `--brand-teal`, etc.) to `:root` so they're available to all themes
2. Remove `[data-theme="sativa"]` block entirely (brand vars now on `:root`)
3. Rewrite `[data-theme="light"]` → `[data-theme="daylight"]` with brand-injected palette above
4. Rewrite `[data-theme="dark"]` → `[data-theme="midnight"]` with brand-injected palette above
5. `[data-theme="indica"]` — change `--accent` from tangelo to gold (`43 89% 60%`), add `--accent-foreground: 137 55% 15%`
6. Update `src/themes/config.ts`: `THEMES` array → `["indica", "daylight", "midnight"]`
7. Update `src/components/theme/theme-provider.tsx`: default theme → `"indica"`, localStorage migration for users with `"sativa"` → `"indica"`, `"light"` → `"daylight"`, `"dark"` → `"midnight"`
8. Update theme switcher UI to show named labels: "Indica", "Daylight", "Midnight"
9. Update topbar logo variant mapping: remove sativa slot, add daylight slot
10. Regenerate scene gradient positions and surface glass tokens for Daylight and Midnight themes

### Files Affected
- `src/app/global.css` — theme definitions, Indica accent change, Daylight/Midnight full token sets
- `src/themes/config.ts` — theme list
- `src/components/theme/theme-provider.tsx` — default, localStorage migration
- `src/components/layout/topbar.tsx` — theme switcher, logo mapping, `menuBadgeVariantByTheme` keyed by old IDs
- `src/lib/brand/index.ts` — `BrandThemeId` type union (`"sativa" | "indica" | "light" | "dark"` → `"indica" | "daylight" | "midnight"`), `THEME_LOGO_MAP`, `THEME_LOGO_FAMILY_SVGS`, `getLogoVariantForTheme()`, `getAuthPanelLogoVariantForTheme()`
- Any component with `data-theme` hardcoded checks

---

## 2. PLP Cards: Unified "Floating" Design

### Decision
Kill all 3 rotating card styles (minimal, cinematic, natural). Replace with a single "Floating" card inspired by dispensary display cases. The product sits on the card background like it's in a display case, with a subtle gold underglow.

### Card Anatomy
```
┌─────────────────────────────┐
│  ┌─────────────────────┐    │
│  │                     │    │  ← 1:1 square image area
│  │   [product image]   │    │     12px internal padding
│  │                     │    │     radial gold underglow at bottom
│  │  [tag] [tag]        │    │     tag badges top-left
│  └─────────────────────┘    │
│                             │
│  Strength: 25mg             │  ← gold, uppercase, 10px
│  Product Title              │  ← foreground, semibold, 15px
│  Brand • Subtitle           │  ← foreground/50, 11px
│                             │
│  $34.99          View →     │  ← price left, CTA right
└─────────────────────────────┘
```

### CSS Specifications
- Card background: `hsl(var(--card))`
- Card border: `1px solid hsl(var(--border) / 0.3)`
- Card border-radius: `16px` (rounded-2xl)
- No min-height — content determines height
- Image area: `aspect-ratio: 1/1`, margin `12px 12px 0`, border-radius `12px`
- Image area background: `radial-gradient(ellipse at 50% 100%, hsl(var(--accent) / 0.12), hsl(var(--card)) 70%)` — the gold underglow
- Tag badges: `backdrop-filter: blur(8px)`, `bg-card/70`, `border: 1px solid hsl(var(--border) / 0.15)`, `rounded-full`, `text-[10px]`, `font-semibold`
- Hover: `translateY(-6px)`, `box-shadow: 0 20px 48px hsl(var(--background) / 0.5)`
- Image hover: `scale(1.02)`, `transition: 300ms ease`
- Grid: `grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, `gap-4` everywhere (no gap collapse)

### Kill List
- Remove CSS classes: `.plp-card--minimal`, `.plp-card--cinematic`, `.plp-card--natural`
- Remove CSS classes: `.plp-card__media-vignette`, `.plp-card__media-glass`, `.plp-card__media-glow`
- Remove from global.css: all card variant styles (~80 lines)
- Remove `surface-panel` class from product cards — replace with `bg-card border border-border/30`
- Remove `cardStyle` prop from `ProductPreview` component
- Remove `styleLabel` prop from `ProductPreview`
- Remove `ResolvedPlpCardStyle` type and `DEFAULT_PLP_CARD_STYLE` constant
- Remove `card-style.ts` module (`src/modules/store/lib/card-style.ts`)
- Remove `PlpCardStyleSwitcher` component entirely
- Remove `activeCardStyle` logic from `paginated-products.tsx`
- Remove card style from URL state (`cardStyle` key in `PlpUrlState`)

### Files Affected
- `src/app/global.css` — remove card variant CSS, add new floating card CSS
- `src/modules/products/components/product-preview/index.tsx` — simplify to single card style, remove `surface-panel`
- `src/modules/products/components/variant-preview/index.tsx` — remove `ResolvedPlpCardStyle` import and prop
- `src/modules/store/lib/card-style.ts` — **delete entirely**
- `src/modules/store/components/plp-card-style-switcher.tsx` — **delete entirely**
- `src/modules/store/lib/url-state.ts` — remove `cardStyle` from `PlpUrlState` type and `PLP_QUERY_KEYS`
- `src/modules/store/templates/index.tsx` — remove `PlpCardStyleSwitcher` import and usage, remove `cardStyle` prop
- `src/modules/store/templates/paginated-products.tsx` — remove card style cycling, `resolvePlpCardStyleForIndex`, `activeCardStyle`
- `src/modules/collections/templates/index.tsx` — remove `PlpCardStyle` import and `cardStyle` prop
- `src/modules/categories/templates/index.tsx` — remove `PlpCardStyle` import and `cardStyle` prop

---

## 3. PDP Layout: 2-Column + Sticky Buy Box

### Decision
Replace the 3-column grid (`1.1fr 0.85fr 0.85fr`) with a 2-column layout (`1fr 1fr`) where the buy box is sticky and details accordion moves below the fold.

### Layout Structure
```
┌──────────────────────────────────────────┐
│  Topbar                                   │
├────────────────────┬─────────────────────┤
│                    │  BARNEY'S BOTANICALS │  ← gold, 11px, uppercase
│  ┌──────────────┐  │  Delta-9 THC Gummies │  ← h1, 24px, semibold
│  │              │  │  $24.99 - $89.99     │  ← 20px, bold
│  │  1:1 Image   │  │  ─────────────────── │
│  │              │  │  DOSE                │  ← 10px, uppercase, muted
│  └──────────────┘  │  [50mg         ▾]   │  ← select, h-11
│  [t1][t2][t3][t4]  │  COUNT              │
│                    │  [20ct          ▾]   │
│                    │  FLAVOR             │
│                    │  [Blue Razz     ▾]   │
│                    │                      │
│                    │  ┌────────────────┐  │
│                    │  │  ADD TO CART   │  │  ← gold bg, forest text
│                    │  └────────────────┘  │
│                    │  Free shipping $50+  │
│                    │         (sticky)     │
├────────────────────┴─────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ │
│  │  Description  ▾  │ │  Lab Results  ▸  │ │  ← 2-col accordion grid
│  │  Ingredients  ▸  │ │  Shipping     ▸  │ │
│  └─────────────────┘ └─────────────────┘ │
└──────────────────────────────────────────┘
```

### CSS Specifications
- Main grid: `grid-cols-1 lg:grid-cols-2`, `gap-6 lg:gap-8`
- Image: `aspect-ratio: 1/1`, `rounded-xl` (12px), same background treatment as PLP card
- Thumbnails: `grid-cols-4`, `gap-2`, `aspect-ratio: 1/1`, `rounded-lg` (8px)
- Buy box: `position: sticky`, `top: 80px` (below topbar h-16 + 16px gap), `self-start`
- Brand name: `text-xs`, `font-semibold`, `uppercase`, `tracking-[0.12em]`, `text-accent` (gold)
- Title: `text-2xl` (24px), `font-semibold`, `tracking-tight`
- Price: `text-xl` (20px), `font-bold`
- Option labels: `text-[10px]`, `font-semibold`, `uppercase`, `tracking-[0.12em]`, `text-muted-foreground`
- Add to Cart: `h-12`, `w-full`, `bg-accent`, `text-accent-foreground`, `font-bold`, `rounded-lg`, `text-sm`, `uppercase`, `tracking-[0.08em]`
- Details section: `grid-cols-1 sm:grid-cols-2`, `gap-3`, below a `border-t border-border/30` divider
- Accordion items: `rounded-lg`, `border border-border/30`, `px-4 py-3`
- Mobile: stacks to single column, buy box loses sticky behavior

### Kill List
- Remove 3-column grid: `xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.85fr)_minmax(0,0.85fr)]`
- Remove `aspect-[5/6]` portrait ratio on hero image → `aspect-square` (1:1)
- Remove `rounded-3xl` (30px) on panels → `rounded-xl` (12px)
- Remove `text-3xl` on both title and price → `text-2xl` title, `text-xl` price
- Remove `surface-panel` class from buy box and accordion panels — replace with `bg-card border border-border/30` or no background
- Remove accordion from its own column → move below the fold
- Remove any `min-height` constraints on the product image area

### Files Affected
- `src/modules/products/components/product-detail-client/index.tsx` — full layout refactor (grid, sticky, accordion placement)
- `src/modules/products/components/image-gallery/` — if image gallery is a separate component, update aspect ratio and border radius

---

## 4. App Shell Integration

### Topbar
- Remove `surface-nav` class from the topbar element. The topbar currently applies both `surface-nav` AND inline `bg-background/90 backdrop-blur-xl` — remove the `surface-nav` class and simplify to: `bg-background/85 backdrop-blur-md`
- On scroll: transition to `bg-background/95` for more opacity (use IntersectionObserver or scroll listener, add `transition-colors duration-200`)
- Keep `h-16`, `sticky top-0 z-40`
- Navigation links: `text-sm font-medium` (drop `font-semibold`)
- Theme switcher: show 3 named options (Indica / Daylight / Midnight), use a dropdown or segmented control instead of rotating icon
- Update `menuBadgeVariantByTheme` mapping (lines 48-53 of topbar.tsx) to use new theme IDs

### Footer
- Keep 4-column grid on desktop
- Apply consistent `text-foreground/70` for links, `hover:text-accent` for gold hover
- Section headings: keep `text-xs uppercase tracking-wide`
- Remove heavy border treatment, use `border-t border-border/30`

### Landing Page Hero
- **Out of scope for this sprint.** Hero redesign is listed in Follow-ups below.
- During implementation: if the hero references `[data-theme="sativa"]` or Sativa-specific tokens, update those references to work with the new theme names. Do not redesign the hero layout or visuals.

### Global Surface Treatment
- `surface-panel`: reduce usage. Use only on modals, cart drawer, popovers — not on product cards, buy boxes, or accordion panels
- `surface-button`: keep for topbar interactive elements, tag badges
- `surface-nav`: simplify to lighter blur + opacity treatment
- Product cards and PDP panels should use simple `bg-card border border-border/30` instead of glassmorphism

---

## 5. Global Design Cleanup

### Border Radius Standardization
| Element | Radius | Class |
|---------|--------|-------|
| Cards, panels, modals | 12px | `rounded-xl` |
| Inputs, buttons, selects | 8px | `rounded-lg` |
| Badges, pills, tags | 9999px | `rounded-full` |
| Thumbnails, small images | 8px | `rounded-lg` |
| Hero/main images | 12px | `rounded-xl` |

Kill all `rounded-3xl` (24px) and `rounded-2xl` (16px) usage on panels/cards. The 16px radius is acceptable on the PLP card outer shell only.

### Border Opacity Standardization
- All borders: `border-border/30` as the standard
- Dividers: `border-border/20`
- Active/focus: `border-border/60`
- No more ad-hoc 40/50/60/80% values

### Typography Scale
```
10px — micro labels: PLP card strength line, PDP option labels, tag badges (text-[10px])
11px — micro captions: compliance text, nav meta, footer fine print (text-[11px])
13px — captions, meta text, brand names, subtitles (text-xs)
15px — body, card titles (text-sm / text-[15px])
18px — section headings (text-lg)
20px — PDP price (text-xl)
24px — page titles, PDP title (text-2xl)
32px — hero heading only (text-3xl)
```
Kill truly arbitrary sizes like `text-[1.02rem]`. The 10px and 11px micro sizes are intentional for dense product metadata and compliance text — they're part of the design system, not ad-hoc values.

### Text Shadows
- Remove `text-cast-shadow` from all card and product elements
- Keep only on hero section headings (h1, h2) where depth effect is intentional
- Remove the global `h1, h2, h3, h4, h5, h6` text-shadow rule — apply via class only where needed

### Button Style
- Primary CTA: `bg-accent text-accent-foreground` — gold (`43 89% 60%`) across all three themes (enabled by Indica accent change in Section 1)
- Secondary: `bg-secondary text-secondary-foreground`
- Ghost: `hover:bg-muted`
- Destructive: `bg-destructive text-destructive-foreground`
- All buttons: `rounded-lg` (8px), `h-10` or `h-11`

### Autofill Fix
Replace hardcoded hex in global.css autofill styles:
- `#212121` → `hsl(var(--foreground))`
- `#fff` → `hsl(var(--background))`

### Files Affected
- `src/app/global.css` — text shadow rules, autofill fix, surface class adjustments
- Multiple component files for border radius and opacity standardization
- `src/components/ui/button.tsx` — verify variant styles match spec

---

## 6. Auth Pages + Checkout Visual Pass

### Auth Pages
- Apply new border radius (12px cards, 8px inputs)
- Apply new button style (gold CTA)
- Remove heavy `surface-panel` glassmorphism from auth forms
- Breakpoint QA: 390px (small phone), 768px (tablet), 1440px (desktop)
- Test both Indica and Daylight themes

### Checkout Flow
- Visual verification of all new components from checkout polish sprint:
  - Review step order summary
  - Delivery estimate display
  - Blocked-state address error
  - Payment input dark mode colors
- Apply gold CTA to "Place Order" button
- Ensure geo warning banner and age gate match new design language

### Files Affected
- `src/modules/account/` — auth form components
- `src/modules/checkout/` — checkout step components
- `src/components/layout/age-gate.tsx`
- `src/components/layout/geo-warning-banner.tsx`

---

## Out of Scope (Follow-ups)

1. **Hero redesign** — evaluate `stash@{0}` (550 lines of particle system rework), decide rebuild vs. apply in a follow-up session. Hero should ultimately use forest green depth with gold accent elements, matching the Floating card vocabulary.
2. **Product image upload** — user has transparent-BG images ready, separate task
3. **Collection pages** — no collections assigned yet, design when products are organized
4. **Mobile bottom nav** — evaluate need after breakpoint QA
5. **Animation/motion system** — could add entrance animations later, not now
