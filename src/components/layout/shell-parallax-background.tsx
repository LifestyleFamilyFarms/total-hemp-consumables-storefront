"use client"

import { useEffect, useRef } from "react"

export default function ShellParallaxBackground() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) {
      return
    }

    let rafId = 0

    const updateScrollVar = () => {
      root.style.setProperty("--shell-scroll-y", `${window.scrollY}px`)
      rafId = 0
    }

    const onScroll = () => {
      if (rafId) {
        return
      }
      rafId = window.requestAnimationFrame(updateScrollVar)
    }

    updateScrollVar()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 -z-10 app-shell-parallax">
      <div className="app-shell-layer app-shell-layer--deep" />
      <div className="app-shell-layer app-shell-layer--overlay" />
      <div className="app-shell-layer app-shell-layer--noise" />
    </div>
  )
}
