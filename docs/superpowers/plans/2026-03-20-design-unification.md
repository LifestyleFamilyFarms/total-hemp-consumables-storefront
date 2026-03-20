# Design Unification Sprint — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the storefront's visual language — kill Sativa theme, consolidate card styles, refactor PDP layout, and apply consistent design tokens across all pages.

**Architecture:** CSS-first approach. Theme tokens in `global.css` drive all visual changes. Component work removes dead card-style code and simplifies PDP from 3-col to 2-col sticky layout. No new dependencies.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS, CSS custom properties, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-20-design-unification-design.md`

---

## File Map

### Creates
_(none — all work modifies existing files or deletes dead code)_

### Modifies
| File | Responsibility |
|------|---------------|
| `src/app/global.css` | Theme definitions, card CSS, surface classes, autofill, text shadows |
| `src/themes/config.ts` | Theme list and default |
| `src/components/theme/theme-provider.tsx` | Default theme, localStorage migration |
| `src/lib/brand/index.ts` | `BrandThemeId` union, logo maps, auth panel map |
| `src/components/layout/topbar.tsx` | Theme switcher UI, `surface-nav` removal, badge mapping |
| `src/components/ui/button.tsx` | `rounded-md` → `rounded-lg` |
| `src/modules/products/components/product-preview/index.tsx` | Single card style, remove `surface-panel` |
| `src/modules/products/components/variant-preview/index.tsx` | Remove card-style prop |
| `src/modules/products/components/product-detail-client/index.tsx` | 2-col sticky layout |
| `src/modules/store/templates/index.tsx` | Remove card-style switcher import/usage |
| `src/modules/store/templates/paginated-products.tsx` | Remove card-style cycling |
| `src/modules/store/lib/url-state.ts` | Remove `cardStyle` from state |
| `src/modules/collections/templates/index.tsx` | Remove `cardStyle` prop |
| `src/modules/categories/templates/index.tsx` | Remove `cardStyle` prop |
| `src/modules/account/templates/login-template.tsx` | `rounded-3xl` → `rounded-xl` |
| `src/modules/store/components/plp-controls.tsx` | `rounded-3xl` → `rounded-xl`, `surface-panel` removal |
| `src/modules/store/components/category-media.tsx` | `rounded-3xl` → `rounded-xl`, `surface-panel` removal |
| `src/modules/checkout/components/section-card.tsx` | `rounded-3xl` → `rounded-xl`, `surface-panel` removal |
| `src/modules/checkout/templates/checkout-summary/index.tsx` | `surface-panel` removal |
| `src/modules/checkout/components/steps/index.tsx` | `surface-panel` removal |
| `src/modules/products/components/product-reviews/index.tsx` | `rounded-3xl` → `rounded-xl`, `surface-panel` removal |
| `src/modules/order/components/reorder-action/index.tsx` | `surface-panel` removal |
| `src/modules/layout/templates/footer/index.tsx` | `rounded-3xl` → `rounded-xl`, border opacity |

### Deletes
| File | Reason |
|------|--------|
| `src/modules/store/lib/card-style.ts` | Card-style system killed |
| `src/modules/store/components/plp-card-style-switcher.tsx` | Card-style switcher UI killed |

---

## Task 1: Theme Migration — CSS Custom Properties

**Files:**
- Modify: `src/app/global.css:6-279`

This is the foundational task. All subsequent visual work depends on the theme tokens being correct.

- [ ] **Step 1: Move brand variables to `:root` and rewrite Sativa block**

Remove `[data-theme="sativa"]` from the `:root` selector. Brand variables (`--brand-forest`, `--brand-teal`, etc.) stay on `:root` but the Sativa-specific token assignments (lines 19-84) get deleted. The `:root` block becomes brand vars only.

```css
@layer base {
  :root {
    --brand-forest: 137 55% 22%;
    --brand-teal: 162 80% 36%;
    --brand-butter: 59 80% 82%;
    --brand-gold: 43 89% 60%;
    --brand-tangelo: 20 79% 52%;
    --brand-cocoa: 15 42% 30%;
    --brand-black: 0 0% 1%;
    --brand-graphite: 0 0% 28%;
    --brand-silver: 0 0% 62%;
    --brand-white: 0 0% 100%;
    --radius: 0.625rem;
  }
```

- [ ] **Step 2: Update Indica theme — change accent from tangelo to gold**

In the `[data-theme="indica"]` block (lines 89-151), change:
```css
    --accent: var(--brand-gold);           /* was: var(--brand-tangelo) */
    --accent-foreground: 137 55% 15%;      /* was: var(--brand-black) */
```
Keep `--destructive: var(--brand-tangelo)` unchanged — destructive actions still use tangelo.

- [ ] **Step 3: Write Daylight theme block**

Replace `[data-theme="light"]` (lines 153-215) with `[data-theme="daylight"]`. Full token set from spec including core palette, sidebar, scene gradients, surface glass, type shadow, and app background tokens. Use the raw HSL channel convention for all tokens.

```css
  [data-theme="daylight"] {
    --background: 60 20% 98%;
    --foreground: 137 55% 22%;
    --card: 60 15% 99%;
    --card-foreground: 137 55% 22%;
    --popover: 60 15% 99%;
    --popover-foreground: 137 55% 22%;
    --primary: 137 55% 22%;
    --primary-foreground: 0 0% 100%;
    --secondary: 137 20% 94%;
    --secondary-foreground: 137 55% 22%;
    --muted: 137 15% 92%;
    --muted-foreground: 137 30% 40%;
    --accent: 43 89% 60%;
    --accent-foreground: 137 55% 15%;
    --destructive: 0 70% 50%;
    --destructive-foreground: 0 0% 100%;
    --border: 137 20% 82%;
    --input: 137 20% 82%;
    --ring: 137 55% 22%;

    --sidebar-background: 60 15% 97%;
    --sidebar-foreground: 137 55% 22%;
    --sidebar-primary: 137 55% 22%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 43 89% 60%;
    --sidebar-accent-foreground: 137 55% 15%;
    --sidebar-border: 137 20% 82%;
    --sidebar-ring: 137 55% 22%;

    --app-bg-image: none;
    --app-bg-pattern-opacity: 0;
    --app-bg-filter: none;
    --scene-grad-tl: 137 15% 94%;
    --scene-grad-tr: 43 30% 92%;
    --scene-grad-bl: 137 20% 90%;
    --scene-grad-br: 43 40% 88%;
    --scene-grad-base-start: 60 20% 98%;
    --scene-grad-base-end: 137 15% 96%;
    --app-bg-overlay: hsl(137 15% 94% / 0.3);
    --app-bg-overlay-opacity: 0.3;

    --surface-light-angle: 156deg;
    --surface-light-source-x: 12%;
    --surface-light-source-y: 6%;
    --surface-glass-top: 0 0% 100%;
    --surface-glass-bottom: 137 10% 96%;
    --surface-glass-glow: 43 89% 60%;
    --surface-glass-edge: 0 0% 100%;
    --surface-glass-shadow: 137 30% 20%;
    --surface-border-top-left: 137 15% 94%;
    --surface-border-top-right: 43 30% 92%;
    --surface-border-bottom-left: 137 20% 90%;
    --surface-border-bottom-right: 43 40% 88%;
    --surface-border-mid: 137 15% 96%;
    --type-shadow-color: 137 30% 20%;
    --type-shadow-opacity: 0.06;
    --type-shadow-x: 0px;
    --type-shadow-y: 1px;
  }
```

- [ ] **Step 4: Write Midnight theme block**

Replace `[data-theme="dark"]` (lines 217-279) with `[data-theme="midnight"]`. Full token set from spec.

```css
  [data-theme="midnight"] {
    --background: 137 20% 8%;
    --foreground: 59 30% 92%;
    --card: 137 18% 12%;
    --card-foreground: 59 30% 92%;
    --popover: 137 18% 12%;
    --popover-foreground: 59 30% 92%;
    --primary: 59 30% 92%;
    --primary-foreground: 137 20% 8%;
    --secondary: 137 15% 18%;
    --secondary-foreground: 59 30% 92%;
    --muted: 137 12% 18%;
    --muted-foreground: 137 20% 55%;
    --accent: 43 89% 60%;
    --accent-foreground: 137 20% 8%;
    --destructive: 0 60% 45%;
    --destructive-foreground: 59 30% 92%;
    --border: 137 15% 16%;
    --input: 137 15% 16%;
    --ring: 43 70% 55%;

    --sidebar-background: 137 18% 10%;
    --sidebar-foreground: 59 30% 92%;
    --sidebar-primary: 59 30% 92%;
    --sidebar-primary-foreground: 137 20% 8%;
    --sidebar-accent: 43 89% 60%;
    --sidebar-accent-foreground: 137 20% 8%;
    --sidebar-border: 137 15% 16%;
    --sidebar-ring: 43 70% 55%;

    --app-bg-image: none;
    --app-bg-pattern-opacity: 0;
    --app-bg-filter: none;
    --scene-grad-tl: 137 25% 6%;
    --scene-grad-tr: 43 40% 15%;
    --scene-grad-bl: 137 30% 5%;
    --scene-grad-br: 43 50% 12%;
    --scene-grad-base-start: 137 20% 8%;
    --scene-grad-base-end: 137 15% 6%;
    --app-bg-overlay: hsl(137 20% 4% / 0.5);
    --app-bg-overlay-opacity: 0.5;

    --surface-light-angle: 156deg;
    --surface-light-source-x: 12%;
    --surface-light-source-y: 6%;
    --surface-glass-top: 137 15% 18%;
    --surface-glass-bottom: 137 20% 6%;
    --surface-glass-glow: 43 89% 60%;
    --surface-glass-edge: 59 30% 92%;
    --surface-glass-shadow: 0 0% 0%;
    --surface-border-top-left: 137 25% 6%;
    --surface-border-top-right: 43 40% 15%;
    --surface-border-bottom-left: 137 30% 5%;
    --surface-border-bottom-right: 43 50% 12%;
    --surface-border-mid: 137 15% 6%;
    --type-shadow-color: 0 0% 0%;
    --type-shadow-opacity: 0.3;
    --type-shadow-x: 0px;
    --type-shadow-y: 2px;
  }
```

- [ ] **Step 5: Verify build**

Run: `cd /Users/franciscraven/Desktop/total-hemp/total-hemp-consumables-storefront && yarn build`
Expected: Build succeeds — CSS changes don't break compilation.

- [ ] **Step 6: Commit**

```bash
git add src/app/global.css
git commit -m "feat: migrate themes — kill Sativa, create Daylight/Midnight, update Indica accent"
```

---

## Task 2: Theme Config + Provider + Brand Module

**Files:**
- Modify: `src/themes/config.ts` (full rewrite — 30 lines)
- Modify: `src/components/theme/theme-provider.tsx:7,24,29-31,40-43`
- Modify: `src/lib/brand/index.ts:6,201-226,228-261,263-268`

- [ ] **Step 1: Rewrite theme config**

```typescript
// src/themes/config.ts
export type ThemeDefinition = {
  id: string
  label: string
  description?: string
}

export const DEFAULT_THEME_ID = "indica"

export const THEMES: ThemeDefinition[] = [
  {
    id: "indica",
    label: "Indica",
    description: "Deep resin-rich tones — the brand default.",
  },
  {
    id: "daylight",
    label: "Daylight",
    description: "Clean off-white with forest green primary and gold accent.",
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "Forest-tinted dark mode with gold accents.",
  },
]
```

- [ ] **Step 2: Add localStorage migration to theme provider**

In `theme-provider.tsx`, add a migration map inside the `useEffect` that reads from localStorage (line 26-32):

```typescript
useEffect(() => {
  if (typeof window === "undefined") return
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return

  // Migrate old theme names
  const MIGRATION: Record<string, string> = {
    sativa: "indica",
    light: "daylight",
    dark: "midnight",
  }
  const migrated = MIGRATION[stored] ?? stored

  if (migrated !== stored) {
    window.localStorage.setItem(STORAGE_KEY, migrated)
  }

  if (THEMES.some((item) => item.id === migrated)) {
    setThemeState(migrated)
  }
}, [])
```

- [ ] **Step 3: Update BrandThemeId and logo maps**

In `src/lib/brand/index.ts`:

Change line 6:
```typescript
export type BrandThemeId = "indica" | "daylight" | "midnight"
```

Update `THEME_LOGO_MAP` (lines 201-226) — remove `sativa` and `light`/`dark`, add `daylight` and `midnight`:
```typescript
const THEME_LOGO_MAP: Record<BrandThemeId, Record<BrandLogoSlot, BrandLogoVariant>> = {
  indica: {
    hero: "indicaNavHorizontal",
    nav: "indicaNavHorizontal",
    footer: "footerStackDb",
    compliance: "complianceDb",
  },
  daylight: {
    hero: "heroWordmark",
    nav: "navMonogram",
    footer: "footerStack",
    compliance: "complianceSeal",
  },
  midnight: {
    hero: "heroWordmarkBW",
    nav: "navMonogramBw",
    footer: "complianceSeal",
    compliance: "complianceSeal",
  },
}
```

Update `THEME_LOGO_FAMILY_SVGS` (lines 228-261) — rekey to new theme IDs. `daylight` gets the SVGs from `sativa` + `light`. `midnight` gets the SVGs from `dark`.

Update `AUTH_PANEL_LOGO_MAP` (lines 263-268):
```typescript
const AUTH_PANEL_LOGO_MAP: Record<BrandThemeId, BrandLogoVariant> = {
  indica: "darkBlockBadge",
  daylight: "roundFullColorLogo",
  midnight: "roundBwLogo",
}
```

- [ ] **Step 4: Verify build**

Run: `yarn build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/themes/config.ts src/components/theme/theme-provider.tsx src/lib/brand/index.ts
git commit -m "feat: update theme config, provider migration, and brand logo maps"
```

---

## Task 3: Kill Card-Style System

**Files:**
- Delete: `src/modules/store/lib/card-style.ts`
- Delete: `src/modules/store/components/plp-card-style-switcher.tsx`
- Modify: `src/modules/store/lib/url-state.ts` — remove cardStyle import, key, type field, and parser output
- Modify: `src/modules/store/templates/index.tsx` — remove PlpCardStyleSwitcher import/usage, cardStyle prop
- Modify: `src/modules/store/templates/paginated-products.tsx` — remove card-style imports, cycling logic, style props
- Modify: `src/modules/products/components/product-preview/index.tsx` — remove card-style import and props
- Modify: `src/modules/products/components/variant-preview/index.tsx` — remove card-style import and props
- Modify: `src/modules/collections/templates/index.tsx` — remove PlpCardStyle import and cardStyle prop
- Modify: `src/modules/categories/templates/index.tsx` — remove PlpCardStyle import and cardStyle prop
- Modify: `src/app/[countryCode]/(main)/store/page.tsx` — remove cardStyle from state destructure and template props
- Modify: `src/app/[countryCode]/(main)/collections/[handle]/page.tsx` — remove cardStyle from state and template props
- Modify: `src/app/[countryCode]/(main)/categories/[...category]/page.tsx` — remove cardStyle from state and template props

- [ ] **Step 1: Remove card-style from url-state.ts**

Remove the import of `PlpCardStyle` and `normalizePlpCardStyle` (line 2). Remove `cardStyle` from `PLP_QUERY_KEYS` (line 16). Remove `cardStyle` from `PlpUrlState` type (line 26). Remove `cardStyle` from `parsePlpUrlState` return object (line 79).

- [ ] **Step 2: Remove card-style from paginated-products.tsx**

Remove the entire card-style import block (lines 6-11). Remove `cardStyle` from the component props type (line 30 and 45). Remove `activeCardStyle` calculation (line 46). In both the variants and products `.map()` calls, remove `resolvePlpCardStyleForIndex`, `resolvedStyle`, `cardStyle`, and `styleLabel` props. Pass products/variants directly to `ProductPreview`/`VariantPreview` without card-style props.

- [ ] **Step 3: Remove card-style from store template**

In `src/modules/store/templates/index.tsx`:
- Remove `PlpCardStyleSwitcher` import (line 11)
- Remove `DEFAULT_PLP_CARD_STYLE, PlpCardStyle` import (line 12)
- Remove `cardStyle` from `StoreTemplateProps` (line 36)
- Remove `cardStyle = DEFAULT_PLP_CARD_STYLE` from function signature (line 58)
- Remove `<PlpCardStyleSwitcher value={cardStyle} />` (line 81)
- Remove `cardStyle={cardStyle}` from `<PaginatedProducts>` (line 96)

- [ ] **Step 4: Remove card-style from product-preview and variant-preview**

In `product-preview/index.tsx`:
- Remove `import { DEFAULT_PLP_CARD_STYLE, ResolvedPlpCardStyle } from "@modules/store/lib/card-style"` (lines 9-11)
- Remove `cardStyle` and `styleLabel` props from the component
- Remove `surface-panel plp-card \`plp-card--${cardStyle}\`` className — replace with new floating card class (done in Task 5)

In `variant-preview/index.tsx`:
- Same removal of card-style import and props

- [ ] **Step 5: Remove card-style from collection and category templates**

In `src/modules/collections/templates/index.tsx`: remove `PlpCardStyle` import (line 2) and `cardStyle` prop (line 27).

In `src/modules/categories/templates/index.tsx`: remove `PlpCardStyle` import (line 5) and `cardStyle` prop (line 19).

- [ ] **Step 5b: Remove cardStyle from route-level page files**

These App Router pages destructure `cardStyle` from `parsePlpUrlState()` and pass it to templates. After removing `cardStyle` from `PlpUrlState`, these will fail TypeScript compilation:

In `src/app/[countryCode]/(main)/store/page.tsx`: remove `cardStyle` from the destructured `state` object and from the `<StoreTemplate>` props.

In `src/app/[countryCode]/(main)/collections/[handle]/page.tsx`: remove `cardStyle` from the destructured `state` object and from the template props.

In `src/app/[countryCode]/(main)/categories/[...category]/page.tsx`: remove `cardStyle` from the destructured `state` object and from the template props.

- [ ] **Step 6: Delete card-style files**

```bash
rm src/modules/store/lib/card-style.ts
rm src/modules/store/components/plp-card-style-switcher.tsx
```

- [ ] **Step 7: Verify build**

Run: `yarn build`
Expected: Build succeeds with no imports of deleted files.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: kill card-style system — remove 3-style rotation, switcher, URL state"
```

---

## Task 4: PLP Card CSS — New Floating Style

**Files:**
- Modify: `src/app/global.css:532-675` (replace card variant CSS)
- Modify: `src/modules/products/components/product-preview/index.tsx` (card markup)

- [ ] **Step 1: Replace card CSS in global.css**

Delete all card variant CSS from `.plp-card` through `.plp-card--natural .plp-card__media-glow` (lines 532-675). Replace with new floating card CSS:

```css
  .plp-card {
    position: relative;
    display: flex;
    height: 100%;
    flex-direction: column;
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid hsl(var(--border) / 0.3);
    background-color: hsl(var(--card));
    transition: transform 300ms ease, box-shadow 300ms ease;
  }

  .plp-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 48px hsl(var(--background) / 0.5);
  }

  .plp-card__media {
    position: relative;
    margin: 12px 12px 0;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border-radius: 12px;
    background: radial-gradient(
      ellipse at 50% 100%,
      hsl(var(--accent) / 0.12),
      hsl(var(--card)) 70%
    );
  }

  .plp-card__image {
    border-radius: 8px;
    object-fit: contain;
    padding: 0.75rem;
    transition: transform 300ms ease;
  }

  .group:hover .plp-card__image {
    transform: scale(1.02);
  }

  .plp-card__tag {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background-color: hsl(var(--card) / 0.7);
    border: 1px solid hsl(var(--border) / 0.15);
  }

  .plp-card__title {
    text-shadow: none;
  }

  .plp-card__price {
    letter-spacing: 0.01em;
  }
```

- [ ] **Step 2: Update product-preview markup**

In `src/modules/products/components/product-preview/index.tsx`, update the card's root className from `cn("surface-panel plp-card", \`plp-card--${cardStyle}\`)` to just `"plp-card"`.

Remove the `.plp-card__media-vignette`, `.plp-card__media-glass`, and `.plp-card__media-glow` overlay divs from the image area.

Update tag badges to use the new `.plp-card__tag rounded-full text-[10px] font-semibold` classes.

Change image area from `aspect-ratio: 4/5` class to use the new `.plp-card__media` styles (1:1 ratio with gold underglow is handled by CSS).

- [ ] **Step 3: Update the grid gap and kill text-[1.02rem]**

In `paginated-products.tsx`, change `gap-5` to `gap-4` on both product grid divs (lines 75 and 125).

In `product-preview/index.tsx` and `variant-preview/index.tsx`, find any instances of `text-[1.02rem]` and replace with `text-sm` (15px). This is the "arbitrary size" the spec says to kill.

Note: The existing `.plp-card` CSS had `min-height: 430px` which is deliberately dropped — the new floating card has no min-height so content determines card height.

- [ ] **Step 4: Verify build and visual check**

Run: `yarn build`
Then: `yarn dev` and check `/us/store` at http://localhost:8000/us/store

- [ ] **Step 5: Commit**

```bash
git add src/app/global.css src/modules/products/components/product-preview/index.tsx src/modules/store/templates/paginated-products.tsx
git commit -m "feat: new floating PLP card design — 1:1 image, gold underglow, simplified markup"
```

---

## Task 5: PDP Layout — 2-Column + Sticky Buy Box

**Files:**
- Modify: `src/modules/products/components/product-detail-client/index.tsx:836-1103`

This is the render section of the component — the logic/hooks above line 836 are unchanged.

- [ ] **Step 1: Refactor the grid layout**

Replace the 3-column grid (line 838):
```tsx
<section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.85fr)_minmax(0,0.85fr)] xl:items-start xl:gap-6">
```
With 2-column:
```tsx
<section className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 lg:items-start">
```

- [ ] **Step 2: Refactor image column**

Change the hero image container (line 840):
- Remove `surface-panel` class
- Change `aspect-[5/6]` to `aspect-square`
- Change `rounded-3xl` to `rounded-xl`
- Change `border-border/60` to `border-border/30`
- Add gold underglow background: `bg-[radial-gradient(ellipse_at_50%_100%,hsl(var(--accent)/0.12),hsl(var(--card))_70%)]`

Update thumbnails: change `rounded-xl` to `rounded-lg`, change `border-border/60` to `border-border/30`.

- [ ] **Step 3: Refactor buy box column**

Make the buy box div sticky:
```tsx
<div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
```

Remove `surface-panel` class (line 886). Remove `rounded-3xl` → no rounding needed on the buy box itself.

Add brand name above title. Extract from `product.collection?.title` or `product.metadata?.brand_name` (whichever exists). Only render if a brand name is available:
```tsx
{brandName ? (
  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
    {brandName}
  </p>
) : null}
```
Add above the component's return statement:
```tsx
const brandName = (product as any).collection?.title
  || readMetadataText(product.metadata?.brand_name)
  || ""
```

Change title from `text-3xl` to `text-2xl` (line 889).
Change price from `text-3xl` to `text-xl` (line 901).

Add option labels above each select:
```tsx
<p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
  {option.title}
</p>
```

Style the Add to Cart button:
```tsx
<Button
  onClick={handleAddToCart}
  disabled={!addToCartEnabled}
  className="h-12 w-full bg-accent text-accent-foreground font-bold rounded-lg text-sm uppercase tracking-[0.08em]"
  data-testid="add-product-button"
>
```

Remove the compliance `surface-panel` div (line 1020) — change to `rounded-lg border border-border/30 bg-card`.

- [ ] **Step 4: Move accordion below the fold**

Move the accordion section (lines 1027-1099) out of the 2-column grid and into a new section below it:

```tsx
</section>

{/* Details accordion — below the fold */}
<section className="mt-8 border-t border-border/30 pt-6">
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {/* Description accordion item */}
    <div className="rounded-lg border border-border/30 overflow-hidden">
      <Accordion type="single" collapsible>
        <AccordionItem value="description" className="border-none">
          ...
        </AccordionItem>
      </Accordion>
    </div>
    {/* Ingredients, Lab Results, Shipping — same pattern */}
  </div>
</section>
```

Remove `surface-panel` from all accordion wrappers. Use `rounded-lg border border-border/30 px-4 py-3`.

- [ ] **Step 5: Verify build and visual check**

Run: `yarn build`
Then: `yarn dev` and navigate to any product detail page.

- [ ] **Step 6: Commit**

```bash
git add src/modules/products/components/product-detail-client/index.tsx
git commit -m "feat: PDP 2-column layout with sticky buy box and accordion below fold"
```

---

## Task 6: Topbar + Checkout Header — Simplify Navigation

**Files:**
- Modify: `src/components/layout/topbar.tsx`
- Modify: `src/app/[countryCode]/(checkout)/layout.tsx` — also uses `surface-nav` on checkout header

- [ ] **Step 1: Remove surface-nav class**

Find the topbar root element's className and remove `surface-nav`. Keep/simplify to:
```tsx
className="sticky top-0 z-40 h-16 bg-background/85 backdrop-blur-md border-b border-border/30 transition-colors duration-200"
```

- [ ] **Step 2: Update menuBadgeVariantByTheme**

Update the mapping from old theme IDs to new ones:
```typescript
const menuBadgeVariantByTheme: Record<string, string> = {
  indica: "...",
  daylight: "...",
  midnight: "...",
}
```

- [ ] **Step 3: Verify theme switcher**

The theme switcher component (`src/components/theme/theme-switcher.tsx`) reads from the `THEMES` config and displays each theme's `label` and `description` in a dropdown. After Task 2 rewrites `config.ts` with the new theme IDs and labels, the switcher automatically shows the correct names. No code changes needed — just verify it works visually.

- [ ] **Step 4: Simplify checkout layout header**

In `src/app/[countryCode]/(checkout)/layout.tsx`, find the header element that uses `surface-nav` and replace with the same simplified treatment: `bg-background/85 backdrop-blur-md border-b border-border/30`.

- [ ] **Step 5: Verify build**

Run: `yarn build`

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/topbar.tsx src/app/[countryCode]/(checkout)/layout.tsx
git commit -m "feat: simplify topbar + checkout header — lighter blur, remove surface-nav"
```

---

## Task 7: Global Cleanup — Border Radius, Borders, Autofill, Text Shadows, Button

**Files:**
- Modify: `src/app/global.css:292-300,336-340`
- Modify: `src/components/ui/button.tsx:8`
- Modify: 10+ component files for `rounded-3xl` and `surface-panel` replacement

- [ ] **Step 1: Fix text shadow rule**

In `global.css` lines 292-300, remove the global heading text-shadow rule. Replace with a class-only approach:

```css
  .text-cast-shadow {
    text-shadow: var(--type-shadow-x) var(--type-shadow-y) 0 hsl(var(--type-shadow-color) / var(--type-shadow-opacity));
  }
```

Remove `h1, h2, h3, h4, h5, h6,` from the selector — only `.text-cast-shadow` keeps the rule.

- [ ] **Step 2: Fix autofill styles**

In lines 336-340, replace hardcoded colors:
```css
    border: 1px solid hsl(var(--foreground));
    -webkit-text-fill-color: hsl(var(--foreground));
    -webkit-box-shadow: 0 0 0px 1000px hsl(var(--background)) inset;
```

- [ ] **Step 3: Update button border radius**

In `src/components/ui/button.tsx` line 8, change `rounded-md` to `rounded-lg`:
```typescript
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ..."
```

- [ ] **Step 4: Replace rounded-3xl across components**

For each file that uses `rounded-3xl`, change to `rounded-xl`. Files:
- `src/modules/account/templates/login-template.tsx`
- `src/modules/store/templates/index.tsx` (header panels)
- `src/modules/store/components/plp-controls.tsx`
- `src/modules/store/components/category-media.tsx`
- `src/modules/checkout/components/section-card.tsx`
- `src/modules/products/components/product-reviews/index.tsx`
- `src/modules/layout/templates/footer/index.tsx`
- `src/modules/store/templates/paginated-products.tsx` (empty state divs)

- [ ] **Step 5: Remove surface-panel from non-modal components**

For each file that uses `surface-panel` outside of modals/drawers, replace with `bg-card border border-border/30`. Files:
- `src/modules/store/templates/index.tsx` (header panels)
- `src/modules/store/components/plp-controls.tsx`
- `src/modules/store/components/category-media.tsx`
- `src/modules/checkout/components/section-card.tsx`
- `src/modules/checkout/templates/checkout-summary/index.tsx`
- `src/modules/checkout/components/steps/index.tsx`
- `src/modules/products/components/product-reviews/index.tsx`
- `src/modules/order/components/reorder-action/index.tsx`

- [ ] **Step 6: Standardize border opacity**

In each modified file, replace ad-hoc border opacity values (`border-border/40`, `border-border/50`, `border-border/60`, `border-border/80`) with the standard `border-border/30`. Active/focus states use `border-border/60`.

- [ ] **Step 7: Verify build**

Run: `yarn lint && yarn build`

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: global cleanup — border radius, autofill, text shadows, surface-panel removal"
```

---

## Task 8: Auth + Checkout Visual Pass

**Files:**
- Modify: `src/modules/account/templates/login-template.tsx`
- Modify: `src/modules/checkout/components/section-card.tsx`
- Modify: `src/components/layout/age-gate.tsx`
- Modify: `src/components/layout/geo-warning-banner.tsx`

- [ ] **Step 1: Auth page cleanup**

In login-template.tsx: verify `rounded-xl` on card containers, `rounded-lg` on inputs, gold CTA button. Remove any remaining `surface-panel` on the auth form card.

- [ ] **Step 2: Checkout visual verification**

In section-card.tsx: verify it uses `rounded-xl border border-border/30 bg-card` instead of `surface-panel rounded-3xl`.

Apply gold CTA to "Place Order" button if not already using `bg-accent text-accent-foreground`.

- [ ] **Step 3: Age gate and geo banner**

In `age-gate.tsx`: verify border radius matches spec (12px card, 8px buttons). Apply gold CTA to confirm button.

In `geo-warning-banner.tsx`: ensure it uses `border-border/30` and `rounded-lg` on action buttons.

- [ ] **Step 4: Verify build**

Run: `yarn lint && yarn build`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: auth + checkout visual pass — gold CTAs, consistent borders"
```

---

## Task 9: Final Validation

- [ ] **Step 1: Run full validation gates**

```bash
cd /Users/franciscraven/Desktop/total-hemp/total-hemp-consumables-storefront
yarn lint && yarn build && yarn check:commerce-rules
```

- [ ] **Step 2: Visual smoke test**

Start dev server (`yarn dev`) and check:
- Home page with Indica theme (default)
- Switch to Daylight — verify colors, contrast, readability
- Switch to Midnight — verify dark mode, gold accents
- Product listing page — floating cards, grid gaps
- Product detail page — 2-col layout, sticky buy box, accordion below
- Checkout flow — gold CTAs, consistent borders
- Auth page — clean form, no glassmorphism

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: visual QA adjustments from smoke test"
```
