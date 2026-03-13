# Landing Page Revamp Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder landing page with a cinematic, animation-rich storefront that communicates Total Hemp's premium lifestyle brand through generative art, scroll-driven reveals, and theme-aware design.

**Architecture:** Server-rendered page composed of 7 modular sections under `src/modules/home/`. Animation system uses vanilla IntersectionObserver + CSS keyframes + HTML Canvas (hero only). Zero new dependencies. All Medusa data fetched in `page.tsx` and passed as props.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS, CSS custom properties, HTML Canvas API, vanilla IntersectionObserver, Zod

**Spec:** `docs/superpowers/specs/2026-03-12-landing-page-revamp-design.md`

---

## Chunk 1: Animation Foundation + Hero

### Task 0: Add Brand Color Tokens to Tailwind

**Files:**
- Modify: `tailwind.config.js`

The project's CSS variables (`--brand-teal`, `--brand-gold`, etc.) exist in `global.css` but have no Tailwind color mapping. We need these to use classes like `text-teal`, `bg-gold/10`, `border-tangelo`, etc.

- [ ] **Step 1: Add brand colors to Tailwind theme**

In `tailwind.config.js`, under `theme.extend.colors`, add:

```js
teal: 'hsl(var(--brand-teal))',
gold: 'hsl(var(--brand-gold))',
tangelo: 'hsl(var(--brand-tangelo))',
cocoa: 'hsl(var(--brand-cocoa))',
forest: 'hsl(var(--brand-forest))',
butter: 'hsl(var(--brand-butter))',
```

Verify the CSS variable names match what's in `global.css`. If the CSS variables use a different format (e.g., `--brand-teal: 162 80% 36%` without `hsl()` wrapper), use `hsl(var(--brand-teal) / <alpha-value>)` syntax to enable opacity modifiers.

- [ ] **Step 2: Verify lint passes**

Run: `yarn lint`

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.js
git commit -m "feat: add brand color tokens to Tailwind for landing page"
```

---

### Task 1: Shared Animation Hooks

**Files:**
- Create: `src/lib/hooks/use-scroll-reveal.ts`
- Create: `src/lib/hooks/use-stagger.ts`

- [ ] **Step 1: Create `use-scroll-reveal.ts`**

This hook wraps IntersectionObserver to trigger CSS class-based scroll animations. It manages `will-change` via `data-animating` attribute and respects `prefers-reduced-motion`.

```typescript
"use client"

import { useEffect, useRef } from "react"

type ScrollRevealOptions = {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null)
  const { threshold = 0.15, rootMargin = "0px", once = true } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (prefersReduced) {
      el.classList.add("scroll-revealed")
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-animating", "")
          el.classList.add("scroll-revealed")

          const cleanup = () => {
            el.removeAttribute("data-animating")
            el.removeEventListener("animationend", cleanup)
            el.removeEventListener("transitionend", cleanup)
          }
          el.addEventListener("animationend", cleanup, { once: true })
          el.addEventListener("transitionend", cleanup, { once: true })

          // Fallback cleanup after 1.5s
          setTimeout(cleanup, 1500)

          if (once) observer.unobserve(el)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return ref
}
```

- [ ] **Step 2: Create `use-stagger.ts`**

This hook applies staggered animation delays to children of a container element.

```typescript
"use client"

import { useEffect, useRef } from "react"

type StaggerOptions = {
  delayMs?: number
  threshold?: number
  selector?: string
}

export function useStagger<T extends HTMLElement>(
  options: StaggerOptions = {}
) {
  const ref = useRef<T>(null)
  const { delayMs = 80, threshold = 0.15, selector = ":scope > *" } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (prefersReduced) {
      el.querySelectorAll(selector).forEach((child) => {
        ;(child as HTMLElement).classList.add("scroll-revealed")
      })
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const children = el.querySelectorAll(selector)
          children.forEach((child, i) => {
            const htmlChild = child as HTMLElement
            htmlChild.style.transitionDelay = `${i * delayMs}ms`
            htmlChild.setAttribute("data-animating", "")
            htmlChild.classList.add("scroll-revealed")

            const cleanup = () => {
              htmlChild.removeAttribute("data-animating")
              htmlChild.style.transitionDelay = ""
            }
            setTimeout(cleanup, 1500 + i * delayMs)
          })
          observer.unobserve(el)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delayMs, threshold, selector])

  return ref
}
```

- [ ] **Step 3: Add animation utility classes to `global.css`**

Append these classes to the end of `src/app/global.css` (before the closing comment, if any):

```css
/* ── Landing page animation system ────────────────────────── */

/* Base state for scroll-reveal elements — hidden until observed */
.scroll-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 800ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 800ms cubic-bezier(0.16, 1, 0.3, 1);
}

.scroll-reveal.scroll-revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Variant: fade + scale */
.scroll-reveal--scale {
  opacity: 0;
  transform: scale(0.95);
  transition:
    opacity 800ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 800ms cubic-bezier(0.16, 1, 0.3, 1);
}

.scroll-reveal--scale.scroll-revealed {
  opacity: 1;
  transform: scale(1);
}

/* Variant: slide from left */
.scroll-reveal--left {
  opacity: 0;
  transform: translateX(-24px);
  transition:
    opacity 800ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 800ms cubic-bezier(0.16, 1, 0.3, 1);
}

.scroll-reveal--left.scroll-revealed {
  opacity: 1;
  transform: translateX(0);
}

/* will-change only during active animation */
[data-animating] {
  will-change: transform, opacity;
}

/* Stagger children base state */
.stagger-children > * {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 600ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
}

.stagger-children > .scroll-revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children: scale variant */
.stagger-children--scale > * {
  opacity: 0;
  transform: scale(0.9);
  transition:
    opacity 600ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
}

.stagger-children--scale > .scroll-revealed {
  opacity: 1;
  transform: scale(1);
}

/* Reduced motion: instant visibility, no transforms */
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal,
  .scroll-reveal--scale,
  .scroll-reveal--left,
  .stagger-children > *,
  .stagger-children--scale > * {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}

/* ── Hero keyframes ────────────────────────── */

@keyframes hero-gradient-drift-1 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, 20px) scale(1.1); }
}

@keyframes hero-gradient-drift-2 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(-20px, -30px) scale(1.05); }
}

@keyframes hero-gradient-drift-3 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(15px, -15px) scale(1.15); }
}

@keyframes hero-gradient-drift-4 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(-25px, 10px) scale(1.08); }
}

@keyframes hero-blur-reveal {
  0% { filter: blur(12px); opacity: 0; }
  100% { filter: blur(0); opacity: 1; }
}

@keyframes hero-fade-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes hero-scroll-hint {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

/* SVG icon draw-on animation utility */
.icon-draw-on {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  transition: stroke-dashoffset 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

.scroll-revealed .icon-draw-on {
  stroke-dashoffset: 0;
}
```

- [ ] **Step 4: Verify no lint errors**

Run: `yarn lint`
Expected: No new errors from CSS or hook files

- [ ] **Step 5: Commit**

```bash
git add src/lib/hooks/use-scroll-reveal.ts src/lib/hooks/use-stagger.ts src/app/global.css
git commit -m "feat(home): add scroll-reveal animation system (hooks + CSS)"
```

---

### Task 2: Simplex Noise + Particle System

**Files:**
- Create: `src/modules/home/lib/simplex-noise.ts`
- Create: `src/modules/home/lib/particle-system.ts`

- [ ] **Step 1: Create `simplex-noise.ts`**

Hand-written 2D value noise function. This is not a full simplex noise implementation — it's a smooth random function sufficient for organic particle drift.

```typescript
/**
 * Minimal 2D value noise for organic particle movement.
 * Not a full simplex implementation — uses smooth interpolation
 * of pseudo-random gradients, which is sufficient for visual drift.
 */

const PERM_SIZE = 256
const perm: number[] = []

// Seed permutation table
for (let i = 0; i < PERM_SIZE; i++) perm[i] = i
for (let i = PERM_SIZE - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  ;[perm[i], perm[j]] = [perm[j], perm[i]]
}
// Duplicate to avoid overflow
for (let i = 0; i < PERM_SIZE; i++) perm[PERM_SIZE + i] = perm[i]

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a)
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3
  const u = h < 2 ? x : y
  const v = h < 2 ? y : x
  return (h & 1 ? -u : u) + (h & 2 ? -v : v)
}

export function noise2D(x: number, y: number): number {
  const xi = Math.floor(x) & (PERM_SIZE - 1)
  const yi = Math.floor(y) & (PERM_SIZE - 1)
  const xf = x - Math.floor(x)
  const yf = y - Math.floor(y)

  const u = fade(xf)
  const v = fade(yf)

  const aa = perm[perm[xi] + yi]
  const ab = perm[perm[xi] + yi + 1]
  const ba = perm[perm[xi + 1] + yi]
  const bb = perm[perm[xi + 1] + yi + 1]

  return lerp(
    lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
    lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
    v
  )
}
```

- [ ] **Step 2: Create `particle-system.ts`**

Canvas particle system with pre-computed attractor points from the brand mark.

```typescript
import { noise2D } from "./simplex-noise"

/** Pre-computed attractor positions sampled from the brand mark SVG circle.
 *  These approximate the circular logo shape as particle anchors.
 *  Coordinates normalized to 0-1 range, centered at (0.5, 0.5). */
const ATTRACTOR_POINTS: [number, number][] = (() => {
  const points: [number, number][] = []
  const cx = 0.5,
    cy = 0.5,
    r = 0.3
  // Outer circle — 24 points
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
  }
  // Inner circle — 12 points
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2
    points.push([cx + r * 0.5 * Math.cos(angle), cy + r * 0.5 * Math.sin(angle)])
  }
  // Center cluster — 4 points
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2
    points.push([cx + r * 0.12 * Math.cos(angle), cy + r * 0.12 * Math.sin(angle)])
  }
  return points
})()

type Particle = {
  x: number
  y: number
  baseX: number
  baseY: number
  size: number
  color: string
  alpha: number
  noiseOffsetX: number
  noiseOffsetY: number
  speed: number
}

const BRAND_COLORS = [
  "244,191,61",   // gold
  "18,165,120",   // teal
  "229,101,37",   // tangelo
]

export type ParticleSystemConfig = {
  canvas: HTMLCanvasElement
  particleCount: number
}

export function createParticleSystem({ canvas, particleCount }: ParticleSystemConfig) {
  const ctx = canvas.getContext("2d")!
  let particles: Particle[] = []
  let animationId = 0
  let time = 0
  let isRunning = false
  let scrollProgress = 0

  function resize() {
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.scale(dpr, dpr)
  }

  function initParticles() {
    particles = []
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight

    for (let i = 0; i < particleCount; i++) {
      // Assign to a random attractor point
      const attractor = ATTRACTOR_POINTS[Math.floor(Math.random() * ATTRACTOR_POINTS.length)]
      const baseX = attractor[0] * w
      const baseY = attractor[1] * h
      // Scatter from attractor with some randomness
      const scatter = Math.min(w, h) * 0.15
      const color = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)]

      particles.push({
        x: baseX + (Math.random() - 0.5) * scatter,
        y: baseY + (Math.random() - 0.5) * scatter,
        baseX,
        baseY,
        size: 1.5 + Math.random() * 1.5,
        color,
        alpha: 0.2 + Math.random() * 0.5,
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
        speed: 0.3 + Math.random() * 0.4,
      })
    }
  }

  function draw() {
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    ctx.clearRect(0, 0, w, h)

    // Fade out particles as user scrolls
    const fadeAlpha = Math.max(0, 1 - scrollProgress * 2)
    if (fadeAlpha <= 0) {
      animationId = requestAnimationFrame(draw)
      return
    }

    for (const p of particles) {
      const nx = noise2D(p.noiseOffsetX + time * p.speed * 0.001, p.noiseOffsetY)
      const ny = noise2D(p.noiseOffsetX, p.noiseOffsetY + time * p.speed * 0.001)

      // Drift range increases with scroll (disperse effect)
      const drift = 40 + scrollProgress * 120
      p.x = p.baseX + nx * drift
      p.y = p.baseY + ny * drift

      const alpha = p.alpha * fadeAlpha
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.color},${alpha})`
      ctx.shadowBlur = p.size * 3
      ctx.shadowColor = `rgba(${p.color},${alpha * 0.5})`
      ctx.fill()
    }

    ctx.shadowBlur = 0
    time++

    if (isRunning) {
      animationId = requestAnimationFrame(draw)
    }
  }

  return {
    start() {
      resize()
      initParticles()
      isRunning = true
      draw()
    },
    stop() {
      isRunning = false
      if (animationId) {
        cancelAnimationFrame(animationId)
        animationId = 0
      }
    },
    resize,
    setScrollProgress(progress: number) {
      scrollProgress = Math.max(0, Math.min(1, progress))
    },
    destroy() {
      this.stop()
      particles = []
    },
  }
}
```

- [ ] **Step 3: Verify no lint errors**

Run: `yarn lint`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add src/modules/home/lib/simplex-noise.ts src/modules/home/lib/particle-system.ts
git commit -m "feat(home): add 2D value noise and canvas particle system for hero"
```

---

### Task 3: Hero Section Components

**Files:**
- Create: `src/modules/home/components/hero/gradient-mesh.tsx`
- Create: `src/modules/home/components/hero/particle-canvas.tsx`
- Create: `src/modules/home/components/hero/brand-reveal.tsx`
- Create: `src/modules/home/components/hero/hero-section.tsx`

- [ ] **Step 1: Create `gradient-mesh.tsx`**

CSS-only morphing gradient background layer.

```tsx
export default function GradientMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Teal blob — top left */}
      <div
        className="absolute -left-[10%] -top-[20%] h-[60%] w-[60%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(18,165,120,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "hero-gradient-drift-1 14s ease-in-out infinite alternate",
        }}
      />
      {/* Gold blob — bottom right */}
      <div
        className="absolute -right-[5%] -bottom-[15%] h-[55%] w-[50%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(244,191,61,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "hero-gradient-drift-2 17s ease-in-out infinite alternate",
        }}
      />
      {/* Tangelo blob — center right */}
      <div
        className="absolute right-[20%] top-[30%] h-[40%] w-[35%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(229,101,37,0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: "hero-gradient-drift-3 20s ease-in-out infinite alternate",
        }}
      />
      {/* Forest blob — bottom left */}
      <div
        className="absolute -left-[5%] bottom-[10%] h-[45%] w-[40%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(25,87,43,0.12) 0%, transparent 70%)",
          filter: "blur(55px)",
          animation: "hero-gradient-drift-4 16s ease-in-out infinite alternate",
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create `particle-canvas.tsx`**

Client component wrapping the canvas particle system with IntersectionObserver pause/resume and scroll tracking.

```tsx
"use client"

import { useEffect, useRef } from "react"
import { createParticleSystem } from "../../lib/particle-system"

type ParticleCanvasProps = {
  particleCount?: number
}

export default function ParticleCanvas({
  particleCount = 200,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const systemRef = useRef<ReturnType<typeof createParticleSystem> | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    // Determine particle count based on viewport
    let count = particleCount
    const width = window.innerWidth
    if (width < 512) return // No particles on mobile
    if (width < 1024) count = Math.round(particleCount * 0.4)

    const system = createParticleSystem({ canvas, particleCount: count })
    systemRef.current = system

    // IntersectionObserver: pause when not visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          system.start()
        } else {
          system.stop()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(canvas)

    // Scroll progress for parallax dispersion
    const heroHeight = canvas.closest("section")?.offsetHeight ?? window.innerHeight
    const onScroll = () => {
      const progress = window.scrollY / heroHeight
      system.setScrollProgress(progress)
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    // Resize handler
    const onResize = () => system.resize()
    window.addEventListener("resize", onResize)

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      system.destroy()
    }
  }, [particleCount])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
```

- [ ] **Step 3: Create `brand-reveal.tsx`**

Animated brand logo reveal with blur-to-sharp transition.

```tsx
import { BrandLogo } from "@/components/brand/brand-logo"

export default function BrandReveal() {
  return (
    <div
      className="mb-8 flex justify-center"
      style={{
        animation: "hero-blur-reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm small:h-20 small:w-20">
        <BrandLogo
          slot="hero"
          format="svg"
          size="md"
          className="h-12 w-12"
        />
      </div>
    </div>
  )
}
```

Note: The `small:` breakpoint prefix is the project's 1024px breakpoint. Adjust the responsive size class for mobile (`xsmall:h-16 xsmall:w-16`) if the Tailwind config supports `xsmall:`.

- [ ] **Step 4: Create `hero-section.tsx`**

Composes all layers with content.

```tsx
import GradientMesh from "./gradient-mesh"
import ParticleCanvas from "./particle-canvas"
import BrandReveal from "./brand-reveal"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function HeroSection() {
  return (
    <section
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a1f12] via-[#0d2818] to-[#1a3a2f]"
      style={{ minHeight: "100vh" /* fallback for older browsers */ }}
    >
      {/* Layer 1: Gradient mesh */}
      <GradientMesh />

      {/* Layer 2: Canvas particles */}
      <ParticleCanvas particleCount={200} />

      {/* Layer 3 + 4: Brand reveal + Content */}
      <div className="relative z-10 mx-auto max-w-[680px] px-5 text-center">
        <BrandReveal />

        {/* Headline */}
        <h1 className="mb-4 text-4xl font-normal leading-tight tracking-tight text-white small:text-5xl">
          <span
            style={{
              animation: "hero-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
              animationDelay: "400ms",
              opacity: 0,
            }}
            className="inline-block"
          >
            Elevate Your{" "}
          </span>
          <span
            className="inline-block bg-gradient-to-r from-[#f4bf3d] to-[#e56525] bg-clip-text font-bold text-transparent"
            style={{
              animation: "hero-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
              animationDelay: "600ms",
              opacity: 0,
            }}
          >
            Everyday
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="mb-9 text-lg font-normal leading-relaxed text-white/60"
          style={{
            animation: "hero-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            animationDelay: "800ms",
            opacity: 0,
          }}
        >
          Premium hemp, crafted for how you want to feel.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-wrap justify-center gap-4"
          style={{
            animation: "hero-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            animationDelay: "1000ms",
            opacity: 0,
          }}
        >
          <LocalizedClientLink
            href="/store"
            className="rounded-full bg-gradient-to-r from-teal to-[#0d8a63] px-9 py-3.5 text-[0.95rem] font-medium text-white shadow-[0_4px_20px_rgba(18,165,120,0.3)] transition-all duration-300 hover:shadow-[0_4px_28px_rgba(18,165,120,0.45)] hover:brightness-110"
          >
            Shop Now
          </LocalizedClientLink>
          <a
            href="#shop-by-effect"
            className="rounded-full border border-white/12 bg-white/5 px-9 py-3.5 text-[0.95rem] font-normal text-white/85 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10"
          >
            Explore Effects
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          animation: "hero-scroll-hint 3s ease-in-out infinite",
        }}
      >
        <span className="text-[0.7rem] uppercase tracking-[0.15em] text-white/30">
          Scroll
        </span>
        <div className="h-6 w-px bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Verify lint passes**

Run: `yarn lint`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/modules/home/components/hero/
git commit -m "feat(home): add hero section with gradient mesh, particles, and brand reveal"
```

---

## Chunk 2: Inner Sections (Shop by Effect, Categories, Featured Collection)

### Task 4: Shop by Effect Section

**Files:**
- Create: `src/modules/home/components/shop-by-effect/effect-icons.tsx`
- Create: `src/modules/home/components/shop-by-effect/effect-card.tsx`
- Create: `src/modules/home/components/shop-by-effect/effect-section.tsx`

- [ ] **Step 1: Create `effect-icons.tsx`**

Hand-written SVG icons for each effect.

```tsx
type IconProps = {
  className?: string
}

export function RelaxIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-draw-on ${className ?? ""}`}
    >
      <path d="M12 3c-4 4-7 8-7 12a7 7 0 1 0 14 0c0-4-3-8-7-12z" />
    </svg>
  )
}

export function FocusIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-draw-on ${className ?? ""}`}
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

export function EnergyIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-draw-on ${className ?? ""}`}
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

export function SleepIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-draw-on ${className ?? ""}`}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
```

- [ ] **Step 2: Create `effect-card.tsx`**

```tsx
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type EffectCardProps = {
  name: string
  tagline: string
  facetValue: string
  accentColor: string
  accentRgb: string
  icon: React.ReactNode
}

export default function EffectCard({
  name,
  tagline,
  facetValue,
  accentColor,
  accentRgb,
  icon,
}: EffectCardProps) {
  return (
    <LocalizedClientLink
      href={`/store?effect=${facetValue}`}
      className="group block rounded-2xl border bg-white/[0.03] p-7 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
      style={{
        borderColor: `rgba(${accentRgb}, 0.15)`,
      }}
    >
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background: `rgba(${accentRgb}, 0.12)`,
          color: accentColor,
        }}
      >
        {icon}
      </div>
      <h3 className="mb-1.5 text-sm font-medium text-white">{name}</h3>
      <p className="text-xs leading-relaxed text-white/40">{tagline}</p>
    </LocalizedClientLink>
  )
}
```

- [ ] **Step 3: Create `effect-section.tsx`**

```tsx
"use client"

import { useStagger } from "@lib/hooks/use-stagger"
import { useScrollReveal } from "@lib/hooks/use-scroll-reveal"
import EffectCard from "./effect-card"
import { RelaxIcon, FocusIcon, EnergyIcon, SleepIcon } from "./effect-icons"

const EFFECTS = [
  {
    name: "Relax",
    tagline: "Unwind & decompress",
    facetValue: "relaxation",
    accentColor: "#12a578",
    accentRgb: "18,165,120",
    Icon: RelaxIcon,
  },
  {
    name: "Focus",
    tagline: "Sharpen & create",
    facetValue: "focus",
    accentColor: "#f4bf3d",
    accentRgb: "244,191,61",
    Icon: FocusIcon,
  },
  {
    name: "Energy",
    tagline: "Uplift & energize",
    facetValue: "energy",
    accentColor: "#e56525",
    accentRgb: "229,101,37",
    Icon: EnergyIcon,
  },
  {
    name: "Sleep",
    tagline: "Rest & recover",
    facetValue: "sleep",
    accentColor: "var(--brand-cocoa, #8B6F47)",
    accentRgb: "139,111,71",
    Icon: SleepIcon,
  },
] as const

export default function EffectSection() {
  const headerRef = useScrollReveal<HTMLDivElement>()
  const gridRef = useStagger<HTMLDivElement>({ delayMs: 100 })

  return (
    <section id="shop-by-effect" className="px-5 py-20 small:py-28">
      <div className="mx-auto max-w-6xl">
        <div ref={headerRef} className="scroll-reveal mb-10 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-teal/70">
            Find Your Flow
          </p>
          <h2 className="text-2xl font-normal text-white small:text-3xl">
            Shop by <span className="font-bold">Effect</span>
          </h2>
        </div>

        <div
          ref={gridRef}
          className="stagger-children mx-auto grid max-w-3xl grid-cols-2 gap-4 small:grid-cols-4"
        >
          {EFFECTS.map((effect) => (
            <EffectCard
              key={effect.facetValue}
              name={effect.name}
              tagline={effect.tagline}
              facetValue={effect.facetValue}
              accentColor={effect.accentColor}
              accentRgb={effect.accentRgb}
              icon={<effect.Icon />}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Verify lint passes**

Run: `yarn lint`

- [ ] **Step 5: Commit**

```bash
git add src/modules/home/components/shop-by-effect/
git commit -m "feat(home): add Shop by Effect section with SVG icons and stagger animation"
```

---

### Task 5: Category Grid Section

**Files:**
- Create: `src/modules/home/components/category-grid/category-card.tsx`
- Create: `src/modules/home/components/category-grid/category-section.tsx`

- [ ] **Step 1: Create `category-card.tsx`**

```tsx
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CategoryCardProps = {
  name: string
  handle: string
  description?: string
  accentRgb: string
  secondaryRgb: string
}

const BOTANICAL_CIRCLE_POSITIONS = [
  { top: "-10px", right: "-10px", size: 80 },
  { bottom: "-20px", left: "-15px", size: 60 },
  { top: "10px", left: "-15px", size: 70 },
  { bottom: "-5px", right: "-10px", size: 65 },
  { top: "50%", right: "-20px", size: 55 },
  { bottom: "10px", left: "50%", size: 50 },
]

export default function CategoryCard({
  name,
  handle,
  description,
  accentRgb,
  secondaryRgb,
  index,
}: CategoryCardProps & { index: number }) {
  const circle = BOTANICAL_CIRCLE_POSITIONS[index % BOTANICAL_CIRCLE_POSITIONS.length]

  return (
    <LocalizedClientLink
      href={`/categories/${handle}`}
      className="group relative block overflow-hidden rounded-[20px] border border-white/[0.06] p-10 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]"
      style={{
        background: `linear-gradient(135deg, rgba(${accentRgb}, 0.08), rgba(${secondaryRgb}, 0.05))`,
      }}
    >
      {/* Decorative botanical circle */}
      <div
        className="pointer-events-none absolute rounded-full border opacity-20 transition-opacity duration-500 group-hover:opacity-40"
        style={{
          top: circle.top,
          right: circle.right,
          bottom: circle.bottom,
          left: circle.left,
          width: circle.size,
          height: circle.size,
          borderColor: `rgba(${accentRgb}, 0.15)`,
        }}
        aria-hidden="true"
      />

      <h3 className="mb-1.5 text-base font-medium text-white">{name}</h3>
      {description && (
        <p className="text-sm text-white/35">{description}</p>
      )}
    </LocalizedClientLink>
  )
}
```

- [ ] **Step 2: Create `category-section.tsx`**

```tsx
"use client"

import { useScrollReveal } from "@lib/hooks/use-scroll-reveal"
import { useStagger } from "@lib/hooks/use-stagger"
import CategoryCard from "./category-card"

type NavigationCategory = {
  id: string
  name: string
  handle: string
}

type CategorySectionProps = {
  categories: NavigationCategory[]
}

/** Accent color pairs for categories — cycles through brand palette */
const CATEGORY_ACCENTS: { accent: string; secondary: string }[] = [
  { accent: "18,165,120", secondary: "244,191,61" },   // teal + gold
  { accent: "229,101,37", secondary: "244,191,61" },   // tangelo + gold
  { accent: "147,130,220", secondary: "18,165,120" },   // purple-ish + teal
  { accent: "244,191,61", secondary: "229,101,37" },   // gold + tangelo
  { accent: "18,165,120", secondary: "147,130,220" },   // teal + purple-ish
  { accent: "229,101,37", secondary: "18,165,120" },   // tangelo + teal
]

/** Short descriptors for common hemp categories */
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  gummies: "Precision-dosed edibles",
  tinctures: "Sublingual drops",
  flower: "Premium hemp flower",
  vapes: "Cartridges & disposables",
  topicals: "Balms & creams",
  accessories: "Tools & gear",
  edibles: "Tasty hemp treats",
  capsules: "Easy daily doses",
  concentrates: "Potent extracts",
  pre_rolls: "Ready to enjoy",
}

export default function CategorySection({
  categories,
}: CategorySectionProps) {
  const headerRef = useScrollReveal<HTMLDivElement>()
  const gridRef = useStagger<HTMLDivElement>({ delayMs: 80, selector: ":scope > a" })

  if (!categories.length) return null

  const spotlightCategories = categories.slice(0, 6)

  return (
    <section className="px-5 py-20 small:py-28">
      <div className="mx-auto max-w-6xl">
        <div ref={headerRef} className="scroll-reveal mb-10 text-center">
          <h2 className="text-2xl font-normal text-white small:text-3xl">
            Browse by <span className="font-bold">Category</span>
          </h2>
        </div>

        <div
          ref={gridRef}
          className="stagger-children--scale grid grid-cols-1 gap-4 xsmall:grid-cols-2 small:grid-cols-3"
        >
          {spotlightCategories.map((cat, i) => {
            const colors = CATEGORY_ACCENTS[i % CATEGORY_ACCENTS.length]
            return (
              <CategoryCard
                key={cat.id}
                name={cat.name}
                handle={cat.handle}
                description={CATEGORY_DESCRIPTIONS[cat.handle.toLowerCase()]}
                accentRgb={colors.accent}
                secondaryRgb={colors.secondary}
                index={i}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify lint passes**

Run: `yarn lint`

- [ ] **Step 4: Commit**

```bash
git add src/modules/home/components/category-grid/
git commit -m "feat(home): add Category Grid section with botanical decorations"
```

---

### Task 6: Featured Collection Section

**Files:**
- Create: `src/modules/home/components/featured-collection/collection-product-card.tsx`
- Create: `src/modules/home/components/featured-collection/collection-section.tsx`

- [ ] **Step 1: Create `collection-product-card.tsx`**

Product card with CSS-elevated imagery (radial glow, glass frame).

```tsx
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type CollectionProductCardProps = {
  product: HttpTypes.StoreProduct
  accentRgb: string
  offset?: boolean
}

export default function CollectionProductCard({
  product,
  accentRgb,
  offset = false,
}: CollectionProductCardProps) {
  const thumbnail = product.thumbnail || product.images?.[0]?.url

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className={`group block overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] ${
        offset ? "mt-6" : ""
      }`}
    >
      <div
        className="flex aspect-[3/4] items-center justify-center p-4"
        style={{
          background: `radial-gradient(circle at 50% 40%, rgba(${accentRgb}, 0.1), transparent 70%)`,
        }}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={product.title ?? "Product"}
            width={200}
            height={260}
            className="h-auto max-h-[80%] w-auto max-w-[80%] object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="text-xs text-white/15">No image</span>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-sm font-medium text-white">{product.title}</h4>
      </div>
    </LocalizedClientLink>
  )
}
```

- [ ] **Step 2: Create `collection-section.tsx`**

```tsx
"use client"

import { HttpTypes } from "@medusajs/types"
import { useScrollReveal } from "@lib/hooks/use-scroll-reveal"
import { useStagger } from "@lib/hooks/use-stagger"
import CollectionProductCard from "./collection-product-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CollectionSectionProps = {
  collection: HttpTypes.StoreCollection | null
}

export default function CollectionSection({
  collection,
}: CollectionSectionProps) {
  const copyRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 })
  const gridRef = useStagger<HTMLDivElement>({
    delayMs: 100,
    selector: ":scope > a",
  })

  if (!collection || !collection.products?.length) return null

  const products = collection.products.slice(0, 4)

  return (
    <section className="px-5 py-20 small:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 small:grid-cols-2 small:gap-16">
          {/* Editorial copy — left side */}
          <div ref={copyRef} className="scroll-reveal--left">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold/70">
              Curated Collection
            </p>
            <h2 className="mb-4 text-2xl font-normal leading-snug text-white small:text-3xl">
              The{" "}
              <span className="font-bold text-gold">
                {collection.title}
              </span>
            </h2>
            {collection.metadata?.description && (
              <p className="mb-6 text-base leading-relaxed text-white/50">
                {String(collection.metadata.description)}
              </p>
            )}
            <LocalizedClientLink
              href={`/collections/${collection.handle}`}
              className="inline-block rounded-full border border-gold/25 bg-gold/10 px-7 py-3 text-sm text-gold transition-all duration-300 hover:bg-gold/20"
            >
              Explore Collection
            </LocalizedClientLink>
          </div>

          {/* Product grid — right side, 2x2 with masonry offset */}
          <div
            ref={gridRef}
            className="stagger-children--scale grid grid-cols-2 gap-3"
          >
            {products.map((product, i) => (
              <CollectionProductCard
                key={product.id}
                product={product}
                accentRgb="244,191,61"
                offset={i % 2 === 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify lint passes**

Run: `yarn lint`

- [ ] **Step 4: Commit**

```bash
git add src/modules/home/components/featured-collection/
git commit -m "feat(home): add Featured Collection section with editorial layout"
```

---

## Chunk 3: Remaining Sections + Page Composition

### Task 7: New Arrivals Section

**Files:**
- Create: `src/modules/home/components/new-arrivals/arrivals-section.tsx`

- [ ] **Step 1: Create `arrivals-section.tsx`**

```tsx
"use client"

import { HttpTypes } from "@medusajs/types"
import { useScrollReveal } from "@lib/hooks/use-scroll-reveal"
import { useStagger } from "@lib/hooks/use-stagger"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type ArrivalsSectionProps = {
  products: HttpTypes.StoreProduct[]
}

/** Maps common category handles to brand accent RGB values */
function getCategoryAccent(product: HttpTypes.StoreProduct): string {
  const cats = product.categories?.map((c) => c.handle?.toLowerCase()) ?? []
  if (cats.some((c) => c?.includes("gummy") || c?.includes("edible")))
    return "18,165,120"
  if (cats.some((c) => c?.includes("tincture"))) return "244,191,61"
  if (cats.some((c) => c?.includes("vape"))) return "229,101,37"
  if (cats.some((c) => c?.includes("flower"))) return "147,130,220"
  return "18,165,120" // default teal
}

export default function ArrivalsSection({
  products,
}: ArrivalsSectionProps) {
  const headerRef = useScrollReveal<HTMLDivElement>()
  const gridRef = useStagger<HTMLDivElement>({
    delayMs: 80,
    selector: ":scope > a",
  })

  if (!products.length) return null

  return (
    <section className="px-5 py-20 small:py-28">
      <div className="mx-auto max-w-6xl">
        <div
          ref={headerRef}
          className="scroll-reveal mb-8 flex items-baseline justify-between"
        >
          <h2 className="text-2xl font-normal text-white small:text-3xl">
            Just <span className="font-bold">Dropped</span>
          </h2>
          <LocalizedClientLink
            href="/store"
            className="border-b border-teal/30 text-sm text-teal/70 transition-colors duration-200 hover:text-teal"
          >
            View all
          </LocalizedClientLink>
        </div>

        <div
          ref={gridRef}
          className="stagger-children--scale grid grid-cols-2 gap-4 small:grid-cols-4"
        >
          {products.slice(0, 4).map((product) => {
            const thumbnail = product.thumbnail || product.images?.[0]?.url
            const accentRgb = getCategoryAccent(product)
            const { cheapestPrice } = getProductPrice({ product })

            return (
              <LocalizedClientLink
                key={product.id}
                href={`/products/${product.handle}`}
                className="group block overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.1]"
              >
                <div
                  className="flex aspect-square items-center justify-center"
                  style={{
                    background: `radial-gradient(circle at 50% 40%, rgba(${accentRgb}, 0.1), transparent 70%)`,
                  }}
                >
                  {thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt={product.title ?? "Product"}
                      width={200}
                      height={200}
                      className="h-auto max-h-[75%] w-auto max-w-[75%] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <span className="text-xs text-white/15">No image</span>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-[0.65rem] uppercase tracking-[0.1em] text-teal/70">
                    {product.categories?.[0]?.name ?? "Hemp"}
                  </span>
                  <h4 className="mt-1 text-sm font-medium text-white">
                    {product.title}
                  </h4>
                  {cheapestPrice?.calculated_price && (
                    <p className="mt-1 text-sm font-medium text-gold/80">
                      {cheapestPrice.calculated_price}
                    </p>
                  )}
                </div>
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

**Note:** Uses `getProductPrice()` from `@lib/util/get-product-price` which internally calls `convertToLocale()` for locale-aware currency formatting. No inline `/100` division.

- [ ] **Step 2: Verify lint passes**

Run: `yarn lint`

- [ ] **Step 3: Commit**

```bash
git add src/modules/home/components/new-arrivals/
git commit -m "feat(home): add New Arrivals section with product grid"
```

---

### Task 8: Trust Strip Section

**Files:**
- Create: `src/modules/home/components/trust-strip/trust-icons.tsx`
- Create: `src/modules/home/components/trust-strip/trust-section.tsx`

- [ ] **Step 1: Create `trust-icons.tsx`**

```tsx
type IconProps = { className?: string }

export function LabTestedIcon({ className }: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`icon-draw-on ${className ?? ""}`}>
      <path d="M9 3h6M12 3v6l5.5 8.5a2 2 0 0 1-1.7 3H8.2a2 2 0 0 1-1.7-3L12 9" />
    </svg>
  )
}

export function PremiumIcon({ className }: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`icon-draw-on ${className ?? ""}`}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function ShippingIcon({ className }: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`icon-draw-on ${className ?? ""}`}>
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

export function GuaranteeIcon({ className }: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`icon-draw-on ${className ?? ""}`}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
```

- [ ] **Step 2: Create `trust-section.tsx`**

```tsx
"use client"

import { useScrollReveal } from "@lib/hooks/use-scroll-reveal"
import {
  LabTestedIcon,
  PremiumIcon,
  ShippingIcon,
  GuaranteeIcon,
} from "./trust-icons"

const TRUST_POINTS = [
  { label: "Lab Tested", color: "#12a578", Icon: LabTestedIcon },
  { label: "Premium Quality", color: "#f4bf3d", Icon: PremiumIcon },
  { label: "Fast Shipping", color: "#e56525", Icon: ShippingIcon },
  { label: "Satisfaction Guaranteed", color: "var(--brand-cocoa, #8B6F47)", Icon: GuaranteeIcon },
] as const

export default function TrustSection() {
  const ref = useScrollReveal<HTMLDivElement>()

  return (
    <section className="px-5 py-16">
      <div
        ref={ref}
        className="scroll-reveal mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-12 small:gap-16"
        style={{
          background:
            "linear-gradient(135deg, rgba(18,165,120,0.04), rgba(244,191,61,0.03))",
          borderRadius: "16px",
          padding: "32px 24px",
        }}
      >
        {TRUST_POINTS.map((point) => (
          <div key={point.label} className="text-center">
            <div className="mb-2" style={{ color: point.color }}>
              <point.Icon />
            </div>
            <p className="text-xs font-medium text-white/60">{point.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify lint passes**

Run: `yarn lint`

- [ ] **Step 4: Commit**

```bash
git add src/modules/home/components/trust-strip/
git commit -m "feat(home): add Trust Strip section with SVG draw-on icons"
```

---

### Task 9: Newsletter Section

**Files:**
- Create: `src/lib/data/newsletter.ts`
- Create: `src/modules/home/components/newsletter/newsletter-section.tsx`

- [ ] **Step 1: Create `newsletter.ts` server action stub**

```typescript
"use server"

import { z } from "zod"

const emailSchema = z.string().email("Please enter a valid email address")

export type NewsletterResult = {
  success: boolean
  message: string
}

export async function subscribeToNewsletter(
  email: string
): Promise<NewsletterResult> {
  const parsed = emailSchema.safeParse(email)
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0].message }
  }

  // TODO: Connect to SendGrid when newsletter strategy is defined.
  // For now, log the subscription and return success.
  console.log("[Newsletter] Subscription request:", parsed.data)

  return { success: true, message: "You're in!" }
}
```

- [ ] **Step 2: Create `newsletter-section.tsx`**

```tsx
"use client"

import { useState, useTransition } from "react"
import { useScrollReveal } from "@lib/hooks/use-scroll-reveal"
import { subscribeToNewsletter } from "@lib/data/newsletter"

export default function NewsletterSection() {
  const ref = useScrollReveal<HTMLDivElement>()
  const [email, setEmail] = useState("")
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await subscribeToNewsletter(email)
      setResult(res)
      if (res.success) setEmail("")
    })
  }

  return (
    <section className="px-5 py-20 small:py-28">
      <div
        ref={ref}
        className="scroll-reveal relative mx-auto max-w-lg overflow-hidden rounded-2xl px-6 py-16 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(22,46,36,0.8), rgba(13,40,24,0.8))",
        }}
      >
        {/* Background glow */}
        <div
          className="pointer-events-none absolute -left-[10%] -top-[30%] h-[80%] w-[50%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(244,191,61,0.06), transparent 70%)",
            filter: "blur(40px)",
            animation: "glow-pulse 6s ease-in-out infinite",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          <h2 className="mb-3 text-2xl font-normal text-white small:text-3xl">
            Join the{" "}
            <span className="font-bold text-gold">Collective</span>
          </h2>
          <p className="mb-7 text-sm leading-relaxed text-white/45">
            First access to drops, exclusive offers, and the good stuff
            — straight to your inbox.
          </p>

          {result?.success ? (
            <p className="text-sm font-medium text-teal">{result.message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setResult(null)
                }}
                placeholder="your@email.com"
                required
                className="flex-1 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-colors duration-300 focus:border-teal/40"
              />
              <button
                type="submit"
                disabled={isPending}
                className="whitespace-nowrap rounded-xl bg-gradient-to-r from-teal to-[#0d8a63] px-6 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:brightness-110 disabled:opacity-50"
              >
                {isPending ? "..." : "Join"}
              </button>
            </form>
          )}

          {result && !result.success && (
            <p className="mt-2 text-xs text-tangelo/70">{result.message}</p>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify lint passes**

Run: `yarn lint`

- [ ] **Step 4: Commit**

```bash
git add src/lib/data/newsletter.ts src/modules/home/components/newsletter/
git commit -m "feat(home): add Newsletter CTA section with server action stub"
```

---

### Task 10: Compose Landing Page + Cleanup

**Files:**
- Modify: `src/app/[countryCode]/(main)/page.tsx`
- Remove: empty directories under `src/modules/home/components/` (brand-promise, category-rail, compliance-callout, editorial-deck, featured-products, strain-highlights)

- [ ] **Step 1: Identify the existing `page.tsx` Organization schema function**

Read the current `page.tsx` to locate the `buildOrganizationSchema` import and `metadata` export. These must be preserved.

- [ ] **Step 2: Rewrite `page.tsx`**

Replace the full page content while preserving metadata and JSON-LD. The page is a server component that fetches all data and passes it as props to section components.

```tsx
import { Metadata } from "next"
import { listNavigationCategories } from "@lib/data/categories"
import { listCollections, getCollectionByHandle } from "@lib/data/collections"
import { listProductsForPlp } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"
import { HttpTypes } from "@medusajs/types"
import HeroSection from "@modules/home/components/hero/hero-section"
import EffectSection from "@modules/home/components/shop-by-effect/effect-section"
import CategorySection from "@modules/home/components/category-grid/category-section"
import CollectionSection from "@modules/home/components/featured-collection/collection-section"
import ArrivalsSection from "@modules/home/components/new-arrivals/arrivals-section"
import TrustSection from "@modules/home/components/trust-strip/trust-section"
import NewsletterSection from "@modules/home/components/newsletter/newsletter-section"

export const metadata: Metadata = {
  title: "Total Hemp Consumables",
  description: "Farm to consumer cannabis products.",
}

// Preserved from existing page.tsx — do not modify
const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "")

const buildOrganizationSchema = (countryCode: string) => {
  const baseUrl = normalizeBaseUrl(getBaseURL())
  const storefrontUrl = `${baseUrl}/${countryCode}`

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Total Hemp Consumables",
    url: storefrontUrl,
    logo: `${baseUrl}/opengraph-image.jpg`,
    email: "support@totalhemp.co",
    sameAs: [],
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // Parallel data fetching — .catch() prevents one failure from blocking all
  const [categories, collectionsData, arrivalsData] = await Promise.all([
    listNavigationCategories().catch(() => []),
    listCollections({ fields: "id,handle,title" }).catch(() => ({
      collections: [] as HttpTypes.StoreCollection[],
      count: 0,
    })),
    listProductsForPlp({ countryCode, page: 1, sortBy: "created_at" }),
  ])

  // Fetch featured collection with products (first collection)
  let featuredCollection = null
  if (collectionsData.collections.length > 0) {
    try {
      featuredCollection = await getCollectionByHandle(
        collectionsData.collections[0].handle
      )
    } catch {
      // Silent fail — section will hide
    }
  }

  const organizationSchema = buildOrganizationSchema(countryCode)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      <HeroSection />
      <EffectSection />
      <CategorySection categories={categories} />
      <CollectionSection collection={featuredCollection} />
      <ArrivalsSection products={arrivalsData.products} />
      <TrustSection />
      <NewsletterSection />
    </>
  )
}
```

**Note:** The existing "Value Picks" section (products sorted by `price_asc`) is intentionally removed — it is not part of the new design spec. The existing `ProductPreview` component is also replaced with custom cards designed for the new aesthetic. If `ProductPreview` behavior is desired later, it can be integrated in a follow-up.

**Critical:** Before writing this file, read the current `page.tsx` first to capture the exact `buildOrganizationSchema` implementation and any imports not shown here. Adapt the rewrite to preserve those details exactly.

- [ ] **Step 3: Remove empty placeholder directories**

```bash
# Only remove if empty — check first
find src/modules/home/components -maxdepth 1 -type d -empty
# Then remove empties:
rmdir src/modules/home/components/brand-promise src/modules/home/components/category-rail src/modules/home/components/compliance-callout src/modules/home/components/editorial-deck src/modules/home/components/featured-products src/modules/home/components/strain-highlights 2>/dev/null || true
```

- [ ] **Step 4: Verify lint passes**

Run: `yarn lint`

- [ ] **Step 5: Run build check**

Run: `yarn build`

This is the critical validation — it confirms all imports resolve, all server/client boundaries are correct, and no TypeScript errors exist. Fix any errors before proceeding.

- [ ] **Step 6: Run commerce rules check**

Run: `yarn check:commerce-rules`

Verify no violations (SDK calls only in data layer, no JSON.stringify in SDK bodies, etc.)

- [ ] **Step 7: Commit**

```bash
git add src/app/[countryCode]/(main)/page.tsx
git add -u src/modules/home/components/  # picks up deleted dirs
git commit -m "feat(home): compose landing page with all 7 sections

Replaces placeholder landing page with production-ready cinematic
design: generative hero, Shop by Effect, Category Grid, Featured
Collection, New Arrivals, Trust Strip, and Newsletter CTA."
```

---

## Chunk 4: Polish + Validation

### Task 11: Theme Adaptation Verification

**Files:**
- Possibly modify: `src/app/global.css` (if theme-specific overrides needed)

- [ ] **Step 1: Audit theme token usage**

Search all new files for hardcoded color values that should be theme-aware CSS variables instead. Look for:
- `#12a578` → should use `var(--brand-teal)` or Tailwind `text-teal` where possible
- `#f4bf3d` → `var(--brand-gold)` or `text-gold`
- `#e56525` → `var(--brand-tangelo)` or `text-tangelo`
- `#0a1f12`, `#0d2818` → hero backgrounds should adapt to theme

Static accent colors in the hero gradient mesh, effect cards, and category cards are intentional (they define the brand atmosphere), but section backgrounds and text colors should respond to `[data-theme]`.

- [ ] **Step 2: Add theme-specific overrides if needed**

If the indica (dark) and sativa (light) themes need different hero gradient intensities, add CSS overrides:

```css
/* In global.css, after the hero keyframes */
[data-theme="sativa"] .hero-gradient-mesh {
  /* Brighter blobs for light theme */
}
[data-theme="indica"] .hero-gradient-mesh {
  /* Deeper tones for dark theme */
}
```

Only add these if testing reveals the default looks wrong in a specific theme.

- [ ] **Step 3: Verify all 4 themes render correctly**

Manually test (or instruct user to test) by toggling the theme switcher:
- sativa (default light)
- indica (dark)
- light
- dark

Each should look intentional, not broken.

- [ ] **Step 4: Commit if changes needed**

```bash
git add src/app/global.css
git commit -m "fix(home): add theme-specific overrides for landing page"
```

---

### Task 12: Accessibility + Performance Audit

- [ ] **Step 1: Verify `prefers-reduced-motion` behavior**

Add to `global.css` if not already covered:
- All scroll-reveal animations instant
- Canvas not rendered
- Hero content visible immediately
- No `animation` properties active

The base CSS in Task 1 Step 3 already handles this via the `@media (prefers-reduced-motion: reduce)` block. Verify the canvas component correctly skips initialization.

- [ ] **Step 2: Verify `aria-hidden` on decorative elements**

Ensure all these have `aria-hidden="true"`:
- `<canvas>` particle element
- Gradient mesh `<div>`s
- Botanical circle decorations in category cards
- Trust strip icon containers (icons are supplemental to labels)
- Newsletter background glow

- [ ] **Step 3: Test keyboard navigation**

Tab through the page and verify:
- Hero CTAs are focusable
- Effect cards are focusable links
- Category cards are focusable links
- Collection products are focusable links
- New Arrivals products are focusable links
- Newsletter email input and button are focusable
- All focus indicators are visible (not hidden by animations)

- [ ] **Step 4: Run final validation gates**

```bash
yarn lint && yarn build && yarn check:commerce-rules
```

All three must pass.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix(home): accessibility and performance polish for landing page"
```

---

### Task 13: Final Review

- [ ] **Step 1: Review all files created**

List all new/modified files and verify the count matches expectations:

```bash
git diff --name-only main..HEAD
```

Expected new files (~20):
- `src/lib/hooks/use-scroll-reveal.ts`
- `src/lib/hooks/use-stagger.ts`
- `src/lib/data/newsletter.ts`
- `src/modules/home/lib/simplex-noise.ts`
- `src/modules/home/lib/particle-system.ts`
- `src/modules/home/components/hero/` (4 files)
- `src/modules/home/components/shop-by-effect/` (3 files)
- `src/modules/home/components/category-grid/` (2 files)
- `src/modules/home/components/featured-collection/` (2 files)
- `src/modules/home/components/new-arrivals/` (1 file)
- `src/modules/home/components/trust-strip/` (2 files)
- `src/modules/home/components/newsletter/` (1 file)

Modified files:
- `src/app/[countryCode]/(main)/page.tsx`
- `src/app/global.css`

- [ ] **Step 2: Verify no new dependencies added**

```bash
git diff main..HEAD -- package.json
```

Expected: No changes to `dependencies` or `devDependencies`.

- [ ] **Step 3: Verify no `/100` division in new files**

```bash
# Confirm no inline price scaling in landing page components
grep -r "/ 100\|/100" src/modules/home/ || echo "No /100 patterns found — good"
```

The plan uses `getProductPrice()` from `@lib/util/get-product-price` which handles locale-aware formatting via `convertToLocale`.

- [ ] **Step 4: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore(home): final cleanup for landing page revamp"
```
