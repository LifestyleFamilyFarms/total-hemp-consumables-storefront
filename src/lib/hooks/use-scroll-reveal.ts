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
