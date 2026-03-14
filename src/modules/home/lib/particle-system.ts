import { noise2D } from "./simplex-noise"

/** Pre-computed attractor positions sampled from the brand mark SVG circle.
 *  Coordinates normalized to 0-1 range, centered at (0.5, 0.5). */
const ATTRACTOR_POINTS: [number, number][] = (() => {
  const points: [number, number][] = []
  const cx = 0.5,
    cy = 0.5,
    r = 0.25
  // Outer circle — 20 points
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
  }
  // Inner circle — 10 points
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2
    points.push([cx + r * 0.5 * Math.cos(angle), cy + r * 0.5 * Math.sin(angle)])
  }
  // Center cluster — 6 points
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    points.push([cx + r * 0.15 * Math.cos(angle), cy + r * 0.15 * Math.sin(angle)])
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
  "244,191,61", // gold
  "18,165,120", // teal
  "229,101,37", // tangelo
  "18,165,120", // teal (weighted)
]

/** Distance threshold for connecting lines (in CSS px) */
const CONNECTION_DISTANCE = 100

export type ParticleSystemConfig = {
  canvas: HTMLCanvasElement
  particleCount: number
}

export function createParticleSystem({
  canvas,
  particleCount,
}: ParticleSystemConfig) {
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
      const attractor =
        ATTRACTOR_POINTS[Math.floor(Math.random() * ATTRACTOR_POINTS.length)]
      const baseX = attractor[0] * w
      const baseY = attractor[1] * h
      // Tighter scatter keeps the brand mark shape visible
      const scatter = Math.min(w, h) * 0.08
      const color = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)]

      particles.push({
        x: baseX + (Math.random() - 0.5) * scatter,
        y: baseY + (Math.random() - 0.5) * scatter,
        baseX,
        baseY,
        size: 2 + Math.random() * 2.5,
        color,
        alpha: 0.35 + Math.random() * 0.5,
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
        speed: 0.2 + Math.random() * 0.35,
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

    // Update positions
    for (const p of particles) {
      const nx = noise2D(
        p.noiseOffsetX + time * p.speed * 0.0008,
        p.noiseOffsetY
      )
      const ny = noise2D(
        p.noiseOffsetX,
        p.noiseOffsetY + time * p.speed * 0.0008
      )

      // Drift range increases with scroll (disperse effect)
      const drift = 30 + scrollProgress * 150
      p.x = p.baseX + nx * drift
      p.y = p.baseY + ny * drift
    }

    // Draw connections between nearby particles
    ctx.lineWidth = 0.5
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < CONNECTION_DISTANCE) {
          const lineAlpha =
            (1 - dist / CONNECTION_DISTANCE) * 0.15 * fadeAlpha
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(${particles[i].color},${lineAlpha})`
          ctx.stroke()
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      const alpha = p.alpha * fadeAlpha
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.color},${alpha})`
      ctx.shadowBlur = p.size * 4
      ctx.shadowColor = `rgba(${p.color},${alpha * 0.6})`
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
