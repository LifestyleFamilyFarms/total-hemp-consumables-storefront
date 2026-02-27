"use client"

import { track } from "@vercel/analytics"

type CartEventValue = string | number | boolean | null
type CartEventPayload = Record<string, CartEventValue | undefined>

export function trackCartEvent(name: string, payload: CartEventPayload = {}) {
  try {
    const safePayload: Record<string, CartEventValue> = {}
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined) {
        safePayload[key] = value
      }
    }
    track(name, safePayload)
  } catch {
    // Ignore analytics failures so cart UX never regresses.
  }
}
