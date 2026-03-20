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

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let count = particleCount
    const width = window.innerWidth
    if (width < 512) return
    if (width < 1024) count = Math.round(particleCount * 0.4)

    const system = createParticleSystem({ canvas, particleCount: count })
    systemRef.current = system

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

    const heroHeight = canvas.closest("section")?.offsetHeight ?? window.innerHeight
    const onScroll = () => {
      const progress = window.scrollY / heroHeight
      system.setScrollProgress(progress)
    }
    window.addEventListener("scroll", onScroll, { passive: true })

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
