"use client"

import { track } from "@vercel/analytics"

type CartEventPayload = Record<string, string | number | boolean | null | undefined>

export function trackCartEvent(name: string, payload: CartEventPayload = {}) {
  try {
    track(name, payload)
  } catch {
    // Ignore analytics failures so cart UX never regresses.
  }
}
