import { noise2D } from "./simplex-noise"

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
  pulse: number
  pulseSpeed: number
}

const BRAND_COLORS = [
  "244,191,61", // gold
  "18,165,120", // teal
  "18,165,120", // teal (weighted)
  "229,101,37", // tangelo
]

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
    const cx = w * 0.5
    const cy = h * 0.45 // slightly above center (where logo sits)
    const maxRadius = Math.min(w, h) * 0.42

    for (let i = 0; i < particleCount; i++) {
      // Distribute in a soft radial cluster, denser near center
      const angle = Math.random() * Math.PI * 2
      // Bias toward center: sqrt gives uniform disk, pow(0.7) biases center
      const r = maxRadius * Math.pow(Math.random(), 0.7)
      const baseX = cx + Math.cos(angle) * r
      const baseY = cy + Math.sin(angle) * r
      const color = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)]

      // Particles further from center are smaller and fainter
      const distRatio = r / maxRadius
      const sizeBase = distRatio < 0.3 ? 2.5 : distRatio < 0.6 ? 2 : 1.5
      const alphaBase = distRatio < 0.3 ? 0.6 : distRatio < 0.6 ? 0.4 : 0.2

      particles.push({
        x: baseX,
        y: baseY,
        baseX,
        baseY,
        size: sizeBase + Math.random() * 1.5,
        color,
        alpha: alphaBase + Math.random() * 0.2,
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
        speed: 0.15 + Math.random() * 0.25,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      })
    }
  }

  function draw() {
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    ctx.clearRect(0, 0, w, h)

    // Fade out as user scrolls
    const fadeAlpha = Math.max(0, 1 - scrollProgress * 2)
    if (fadeAlpha <= 0) {
      animationId = requestAnimationFrame(draw)
      return
    }

    for (const p of particles) {
      // Organic noise-driven drift
      const nx = noise2D(
        p.noiseOffsetX + time * p.speed * 0.0006,
        p.noiseOffsetY
      )
      const ny = noise2D(
        p.noiseOffsetX,
        p.noiseOffsetY + time * p.speed * 0.0006
      )

      // Gentle drift that increases on scroll (disperse outward)
      const drift = 20 + scrollProgress * 100
      p.x = p.baseX + nx * drift
      p.y = p.baseY + ny * drift

      // Soft pulsing glow per particle
      p.pulse += p.pulseSpeed
      const pulseFactor = 0.7 + 0.3 * Math.sin(p.pulse)
      const alpha = p.alpha * fadeAlpha * pulseFactor

      // Draw soft glowing ember
      const glowRadius = p.size * 6
      const gradient = ctx.createRadialGradient(
        p.x, p.y, 0,
        p.x, p.y, glowRadius
      )
      gradient.addColorStop(0, `rgba(${p.color},${alpha})`)
      gradient.addColorStop(0.3, `rgba(${p.color},${alpha * 0.4})`)
      gradient.addColorStop(1, `rgba(${p.color},0)`)

      ctx.beginPath()
      ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Bright core
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.color},${Math.min(1, alpha * 1.5)})`
      ctx.fill()
    }

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
