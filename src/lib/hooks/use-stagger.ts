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
