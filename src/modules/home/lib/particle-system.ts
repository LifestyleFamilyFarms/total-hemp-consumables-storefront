import { noise2D } from "./simplex-noise"

const ATTRACTOR_POINTS: [number, number][] = (() => {
  const points: [number, number][] = []
  const cx = 0.5, cy = 0.5, r = 0.3
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
  }
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2
    points.push([cx + r * 0.5 * Math.cos(angle), cy + r * 0.5 * Math.sin(angle)])
  }
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
      const attractor = ATTRACTOR_POINTS[Math.floor(Math.random() * ATTRACTOR_POINTS.length)]
      const baseX = attractor[0] * w
      const baseY = attractor[1] * h
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

    const fadeAlpha = Math.max(0, 1 - scrollProgress * 2)
    if (fadeAlpha <= 0) {
      animationId = requestAnimationFrame(draw)
      return
    }

    for (const p of particles) {
      const nx = noise2D(p.noiseOffsetX + time * p.speed * 0.001, p.noiseOffsetY)
      const ny = noise2D(p.noiseOffsetX, p.noiseOffsetY + time * p.speed * 0.001)

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
