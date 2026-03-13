# Landing Page Revamp — Design Spec

**Date:** 2026-03-12
**Status:** Approved
**Mockups:** `.superpowers/brainstorm/72315-1773370204/`

## Overview

Complete revamp of the Total Hemp Consumables storefront landing page. Replaces all placeholder content with a production-ready, cinematic, animation-rich page that communicates premium quality through lifestyle-first branding.

**Brand direction:** Premium + Lifestyle blend. Lead with the experience ("Elevate your everyday"), back it with quality credentials. Trust earned through vibe first, facts second.

**Animation vibe:** Smooth & Organic. Gentle fade-ins, soft parallax, flowing scroll reveals. Natural easing curves — nothing snaps or bounces.

**Animation density:** Layered. Hero gets cinematic treatment. Inner sections use consistent scroll-reveal (fade + drift up) with one accent animation each.

## Page Structure

Seven sections in order:

1. **Hero** — Full-viewport cinematic with generative art
2. **Shop by Effect** — Experiential browsing (Relax, Focus, Energy, Sleep)
3. **Category Grid** — Visual product type navigation
4. **Featured Collection** — Editorial spotlight on a curated set
5. **New Arrivals** — Latest products in a clean grid
6. **Trust Strip** — Lab-tested, quality badges — understated
7. **Newsletter / Community CTA** — "Join the collective" signup

## Section 1: Hero

Full-viewport (100vh) cinematic experience built from four composited layers:

### Layer 1: Morphing Gradient Mesh (CSS)
- 3-4 large radial gradient blobs in brand colors (forest, teal, gold, tangelo)
- Each blob animates position and scale with CSS `@keyframes` on alternating 12-18s cycles
- `filter: blur(60px)` for soft edges
- Theme-aware: sativa theme uses brighter teal/gold, indica uses deeper forest/tangelo

### Layer 2: Canvas Particle Field (JS)
- HTML Canvas element covering the viewport
- Particles sampled from the brand mark SVG paths (FULL_COLOR_ICON_PRINT.svg) — extract path coordinates to use as particle spawn/attractor positions
- ~200 particles on desktop, ~80 on tablet, 0 on mobile
- Movement driven by simplex noise for organic drift
- Particle colors: gold (#f4bf3d), teal (#12a578), tangelo (#e56525) with varying opacity
- Each particle: 2-3px, soft glow via `shadowBlur`
- `requestAnimationFrame` loop, paused when hero is not in viewport (IntersectionObserver)
- `prefers-reduced-motion`: canvas not initialized at all

### Layer 3: Brand Mark Reveal
- Brand circular mark (FULL_COLOR_ICON_PRINT.svg or noTM variant) centered above headline
- Entrance animation: blur(12px) → blur(0) over 1.2s with concurrent opacity 0→1
- Optional clip-path wipe reveal (circle expanding from center)
- Size: ~80px on desktop, ~64px on mobile

### Layer 4: Content
- **Headline:** "Elevate Your Everyday"
  - "Elevate Your" in font-weight 300, white
  - "Everyday" in font-weight 600, gradient text (gold → tangelo)
  - Staggered word fade-in (200ms delay per word)
- **Subheadline:** "Premium hemp, crafted for how you want to feel." — rgba white, weight 300
- **CTAs:**
  - Primary: "Shop Now" — teal gradient fill, pill shape, glow shadow
  - Secondary: "Explore Effects" — glass morphism outline, pill shape
  - Both slide up from 20px below with 200ms stagger after headline
- **Scroll indicator:** Bottom center, "Scroll" label + gradient line, fade-pulse animation

### Scroll Behavior
- All layers parallax at different speeds (gradient mesh slowest, content fastest)
- Particles disperse outward on scroll
- Content fades out with slight upward drift

### Mobile Tier
| Tier | Layers Active |
|---|---|
| Desktop (>1024px) | All 4 layers, full particles |
| Tablet (512-1024px) | Gradient mesh + reduced particles (~80) + content |
| Mobile (<512px) | Gradient mesh + brand reveal + content (CSS-only) |
| Reduced motion | Static gradient + logo + content, instant render |

## Section 2: Shop by Effect

**Purpose:** Experiential product discovery by mood/effect.

### Layout
- Section label: "Find Your Flow" — uppercase, letter-spaced, teal color
- Heading: "Shop by **Effect**" — weight 300/600 split
- 4-column grid (2-column on mobile): Relax, Focus, Energy, Sleep

### Cards
- Glass morphism: `rgba(255,255,255,0.03)` background, `backdrop-filter: blur(8px)`, 1px border in accent color at 15% opacity
- Each card has a unique accent color:
  - Relax: teal (#12a578)
  - Focus: gold (#f4bf3d)
  - Energy: tangelo (#e56525)
  - Sleep: purple (#9382dc)
- Circular icon container (48px) with custom SVG icon per effect
- Short label + tagline below icon

### Animation
- Cards stagger in from below: `translateY(24px) → 0`, `opacity 0→1`, 100ms delay between each
- SVG icons draw on with `stroke-dashoffset` animation (400ms, starts after card is visible)
- Hover: card lifts (`translateY(-4px)`), border color intensifies to 30% opacity, subtle box-shadow glow in accent color

### Custom SVG Icons (hand-written)
- Relax: water droplet
- Focus: sun/rays
- Energy: lightning bolt
- Sleep: crescent moon

## Section 3: Category Grid

**Purpose:** Visual product type navigation.

### Layout
- Heading: "Browse by **Category**"
- 3-column responsive grid (2-column tablet, 1-column mobile)
- Categories: Gummies, Tinctures, Flower, Vapes, Topicals, Accessories (dynamic from Medusa categories)

### Cards
- Glass morphism cards with gradient backgrounds unique to each category
- Abstract botanical circle shapes (SVG) positioned as decorative elements within cards — thin stroke, low opacity, organic positioning
- Category name + short descriptor

### Animation
- Grid fades in as a unit, then cards scale `0.95→1` with 80ms staggered delays
- Decorative SVG circles draw on with stroke animation
- Hover: border glow + `translateY(-2px)` lift + gradient background intensifies

### Data Source
- Categories fetched from Medusa via `listCategories()` (existing data layer)
- Spotlight up to 6 categories (configurable)

## Section 4: Featured Collection

**Purpose:** Editorial spotlight on a curated collection with rich visual treatment.

### Layout
- 2-column split: editorial copy (left) + product grid (right)
- Copy side: collection label, name (with brand-colored keyword), description, CTA button
- Product side: 2x2 grid with staggered vertical offset (masonry-like feel)
- Stacks vertically on mobile

### Product Image Treatment
- Product PNGs displayed on gradient-lit backgrounds
- Radial glow behind each product in collection's accent color
- `border-radius: 16px`, glass card frame
- Soft drop shadows

### Animation
- Copy slides in from left (`translateX(-24px) → 0`)
- Product grid items fade up with staggered masonry offset (alternating cards offset by 24px)
- CTA button: ghost/outline style with accent color, pill shape

### Data Source
- Featured collection from Medusa via `listCollections()` (first or pinned collection)

## Section 5: New Arrivals

**Purpose:** Latest products in a clean, shoppable grid.

### Layout
- Header row: "Just **Dropped**" heading + "View all" link (right-aligned)
- 4-column product card grid (2-column mobile)

### Product Cards
- Glass card with 1px border
- Image area: square aspect ratio, radial glow background in category accent color, product PNG centered
- Info area: category label (uppercase, accent color), product name, price (gold)

### Animation
- Header fades in
- Cards scale up `0.9→1` with 80ms staggered delays
- Hover: card lifts (`translateY(-4px)`), image scales subtly (`1.02x`), glow intensifies

### Data Source
- Products from Medusa via `listProducts()` sorted by `created_at` desc, limit 4

## Section 6: Trust Strip

**Purpose:** Quality credentials — understated, confident, not clinical.

### Layout
- Compact horizontal bar with centered flex items
- 4 trust points: Lab Tested, Premium Quality, Fast Shipping, Satisfaction Guaranteed
- Each: custom SVG icon + short label

### Colors
- Each icon in a different brand accent (teal, gold, tangelo, purple)
- Background: subtle gradient strip

### Animation
- Entire strip fades in as one unit
- SVG icons draw on with `stroke-dashoffset` (staggered 100ms)
- No hover effects — this section is passive/informational

## Section 7: Newsletter / Community CTA

**Purpose:** Email capture with brand-aligned messaging.

### Layout
- Centered content, max-width 480px
- Heading: "Join the **Collective**" — gold keyword
- Subtitle: "First access to drops, exclusive offers, and the good stuff."
- Email input + "Join" button in a flex row
- Background: subtle radial glow (gold, pulsing gently)

### Animation
- Soft fade-in with drift up
- Background glow pulses (CSS `@keyframes`, 6s cycle)
- Input field border glows teal on focus (`transition: border-color 300ms`)

### Form Behavior
- Client-side email validation (Zod)
- Server action for submission (connect to newsletter provider when ready)
- Success state: input transforms to "You're in!" confirmation

## Global Animation System

### Scroll Reveal
- **Trigger:** `IntersectionObserver` with `threshold: 0.15`
- **Base animation:** `opacity 0→1`, `translateY(20px) → 0`
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — organic, decelerating
- **Duration:** 600-900ms for section reveals
- **Stagger:** 60-100ms between sibling elements

### Micro-interactions
- Hover transitions: 200-300ms
- Focus transitions: 300ms
- Button press: subtle `scale(0.98)` on active

### Implementation Approach
- Pure CSS + vanilla JS `IntersectionObserver` — zero animation library dependencies
- CSS `@keyframes` for continuous animations (gradient mesh, background pulses)
- Canvas API for particle system (hero only)
- Simplex noise via small inline utility (~1KB) for organic particle movement
- All colors via CSS custom properties for automatic theme adaptation

### Performance Budget
- Canvas particle system: lazy-initialized after first paint
- `IntersectionObserver` pauses canvas when hero not visible
- `will-change` applied sparingly (only during active animations, removed after)
- Total JS for animation system: ~8-12KB (particles + simplex noise + scroll observer)
- CSS animations: GPU-composited (transform, opacity only — no layout triggers)

### Accessibility
- `prefers-reduced-motion: reduce` → all animations disabled, content renders immediately
- Focus indicators preserved on all interactive elements
- Canvas is decorative (`aria-hidden="true"`)
- All content accessible without animation

## Theme Adaptation

All sections adapt to the active theme via CSS custom properties:

| Element | Sativa (Light) | Indica (Dark) |
|---|---|---|
| Hero gradient mesh | Brighter teal/gold blobs | Deeper forest/tangelo |
| Particle colors | Teal + gold dominant | Gold + tangelo dominant |
| Section backgrounds | Lighter forest tones | Darker, richer depths |
| Glass surfaces | Higher opacity whites | Lower opacity whites |
| Accent highlights | Teal primary | Gold primary |
| Trust/CTA glows | Teal radials | Gold radials |

## File Structure

New/modified files:

```
src/app/[countryCode]/(main)/page.tsx          — Rewritten: new section composition
src/modules/home/                               — New module directory
  components/
    hero/
      hero-section.tsx                          — Hero layout + content
      gradient-mesh.tsx                         — CSS gradient mesh layer
      particle-canvas.tsx                       — Canvas particle system (client component)
      brand-reveal.tsx                          — Logo reveal animation
    shop-by-effect/
      effect-section.tsx                        — Section layout
      effect-card.tsx                           — Individual effect card
      effect-icons.tsx                          — Custom SVG icons
    category-grid/
      category-section.tsx                      — Section layout
      category-card.tsx                         — Category card with botanical decorations
    featured-collection/
      collection-section.tsx                    — Editorial layout
      collection-product-card.tsx               — Elevated product card
    new-arrivals/
      arrivals-section.tsx                      — Section layout
    trust-strip/
      trust-section.tsx                         — Trust bar layout
      trust-icons.tsx                           — Custom SVG trust icons
    newsletter/
      newsletter-section.tsx                    — CTA layout + form
  hooks/
    use-scroll-reveal.ts                        — IntersectionObserver hook for scroll animations
    use-stagger.ts                              — Staggered children animation hook
  lib/
    simplex-noise.ts                            — Minimal simplex noise implementation (~1KB)
    particle-system.ts                          — Canvas particle system logic
src/app/global.css                              — Additional keyframes + animation utility classes
tailwind.config.js                              — New animation keyframes if needed
```

## Dependencies

**None added.** The entire animation system is built with:
- CSS `@keyframes` + custom properties
- Vanilla `IntersectionObserver` API
- HTML Canvas API
- Inline simplex noise utility

## Out of Scope

- Product photography improvements (using CSS elevation of existing PNGs)
- Backend/Medusa changes
- Navigation/topbar/footer modifications
- Checkout or account flow changes
- SEO meta tags (separate task)
