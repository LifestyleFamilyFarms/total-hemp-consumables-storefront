# Design Unification Sprint — Design Spec

**Date:** 2026-03-20
**Status:** Approved
**Scope:** Theme migration, PLP card redesign, PDP layout refactor, app shell integration, global cleanup, auth/checkout visual pass

---

## 1. Theme System: 4 → 3

### Decision
Kill Sativa theme. Keep Indica as default. Create Daylight (branded light) and Midnight (branded dark) by injecting brand DNA into the current generic Light/Dark themes.

### Indica (Default — Unchanged)
- Background: `137 55% 22%` (forest green)
- Foreground: `59 80% 82%` (butter)
- Card: `137 40% 18%`
- Primary: butter / Primary-foreground: forest
- Secondary: cocoa / Secondary-foreground: butter
- Accent: tangelo
- Muted-foreground: gold
- Ring: gold

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

Scene gradient positions should use muted green/gold tones instead of the current pure gray.

### Midnight (Replaces Dark)
Near-black with forest green tints in the grays, gold accents. Total Hemp at night.

- Background: `137 20% 8%` (forest-tinted black)
- Foreground: `59 30% 92%` (warm off-white)
- Card: `137 18% 12%` (forest-tinted dark)
- Primary: `59 30% 92%` / Primary-foreground: `137 20% 8%`
- Secondary: `137 15% 18%` / Secondary-foreground: `59 30% 92%`
- Accent: `43 89% 60%` (gold) / Accent-foreground: `137 20% 8%`
- Muted: `137 12% 18%` / Muted-foreground: `137 20% 55%`
- Border: `137 15% 16%`
- Ring: `43 70% 55%`
- Destructive: `0 60% 45%` / Destructive-foreground: `59 30% 92%`

Scene gradient positions should use deep forest/gold tones instead of pure gray.

### Migration Steps
1. Move brand color variables (`--brand-forest`, `--brand-teal`, etc.) to `:root` so they're available to all themes
2. Remove `[data-theme="sativa"]` block entirely (brand vars now on `:root`)
3. Rewrite `[data-theme="light"]` → `[data-theme="daylight"]` with brand-injected palette above
4. Rewrite `[data-theme="dark"]` → `[data-theme="midnight"]` with brand-injected palette above
5. `[data-theme="indica"]` stays unchanged
6. Update `src/themes/config.ts`: `THEMES` array → `["indica", "daylight", "midnight"]`
7. Update `src/components/theme/theme-provider.tsx`: default theme → `"indica"`, localStorage migration for users with `"sativa"` → `"indica"`, `"light"` → `"daylight"`, `"dark"` → `"midnight"`
8. Update theme switcher UI to show named labels: "Indica", "Daylight", "Midnight"
9. Update topbar logo variant mapping: remove sativa slot, add daylight slot
10. Regenerate scene gradient positions and surface glass tokens for Daylight and Midnight themes

### Files Affected
- `src/app/global.css` — theme definitions
- `src/themes/config.ts` — theme list
- `src/components/theme/theme-provider.tsx` — default, localStorage migration
- `src/components/layout/topbar.tsx` — theme switcher, logo mapping
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
- Remove `cardStyle` prop from `ProductPreview` component
- Remove `ResolvedPlpCardStyle` type and `DEFAULT_PLP_CARD_STYLE` constant
- Remove `card-style.ts` module (`src/modules/store/lib/card-style.ts`)
- Remove `styleLabel` prop from `ProductPreview`
- Remove `activeCardStyle` logic from `paginated-products.tsx`

### Files Affected
- `src/app/global.css` — remove card variant CSS, add new floating card CSS
- `src/modules/products/components/product-preview/index.tsx` — simplify to single card style
- `src/modules/store/templates/paginated-products.tsx` — remove card style cycling
- `src/modules/store/lib/card-style.ts` — delete entirely

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
- Remove `aspect-[5/6]` portrait ratio on hero image
- Remove `rounded-3xl` (30px) on panels → `rounded-xl` (12px)
- Remove `text-3xl` on both title and price → `text-2xl` title, `text-xl` price
- Remove `surface-panel` class from buy box and accordion panels
- Remove accordion from its own column → move below

### Files Affected
- `src/modules/products/components/product-detail-client/index.tsx` — full layout refactor

---

## 4. App Shell Integration

### Topbar
- Replace heavy `surface-nav` glassmorphism with: `bg-background/85 backdrop-blur-md` (lighter)
- On scroll: transition to `bg-background/95` for more opacity (use IntersectionObserver or scroll listener)
- Keep `h-16`, `sticky top-0 z-40`
- Navigation links: `text-sm font-medium` (drop `font-semibold`)
- Theme switcher: show 3 named options (Indica / Daylight / Midnight), use a dropdown or segmented control instead of rotating icon

### Footer
- Keep 4-column grid on desktop
- Apply consistent `text-foreground/70` for links, `hover:text-accent` for gold hover
- Section headings: keep `text-xs uppercase tracking-wide`
- Remove heavy border treatment, use `border-t border-border/30`

### Landing Page Hero
- Evaluate stashed hero work (`stash@{0}`) — 550 lines of particle system rework
- If the hero uses the old Sativa palette or feels disconnected from Indica, redesign to match new design language
- Hero should use forest green depth with gold accent elements, matching the Floating card vocabulary
- This is a **follow-up task** — evaluate the stash first, then decide rebuild vs. apply

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
13px — captions, labels, meta text
15px — body, card titles
18px — section headings, prices
24px — page titles, PDP title (text-2xl)
32px — hero heading only (text-3xl)
```
Kill arbitrary sizes like `text-[1.02rem]`, `text-[10px]`, `text-[11px]` where possible. Map to nearest scale step.

### Text Shadows
- Remove `text-cast-shadow` from all card and product elements
- Keep only on hero section headings (h1, h2) where depth effect is intentional
- Remove the global `h1, h2, h3, h4, h5, h6` text-shadow rule — apply via class only where needed

### Button Style
- Primary CTA: `bg-accent text-accent-foreground` (gold on Indica/Midnight, gold on Daylight)
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

1. **Hero redesign** — evaluate stash first, then decide in a follow-up session
2. **Product image upload** — user has transparent-BG images ready, separate task
3. **Collection pages** — no collections assigned yet, design when products are organized
4. **Mobile bottom nav** — evaluate need after breakpoint QA
5. **Animation/motion system** — could add entrance animations later, not now
