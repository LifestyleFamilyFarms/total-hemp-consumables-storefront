"use client"

import { useEffect, useState } from "react"
import { BLOCKED_SHIPPING_STATE_CODES, blockedStateName } from "@lib/constants/shipping"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { X } from "lucide-react"

const DISMISS_KEY = "geo_banner_dismissed"

function getGeoRegion(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/(?:^|;\s*)geo_region=([A-Z]{2})/)
  return match?.[1] ?? null
}

export default function GeoWarningBanner() {
  const [visible, setVisible] = useState(false)
  const [stateName, setStateName] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return
    } catch {
      // sessionStorage unavailable (private browsing, storage full)
    }
    const region = getGeoRegion()
    if (region && BLOCKED_SHIPPING_STATE_CODES.has(region)) {
      setStateName(blockedStateName(region) ?? region)
      setVisible(true)
    }
  }, [])

  if (!visible || !stateName) return null

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // sessionStorage unavailable
    }
    setVisible(false)
  }

  return (
    <div
      className="relative flex items-center justify-center gap-x-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200 sm:text-sm"
      role="status"
      aria-label="Shipping restriction notice"
    >
      <p>
        Hemp shipping is unavailable in {stateName}. You can still ship to
        approved states.{" "}
        <LocalizedClientLink
          href="/content/shipping-returns"
          className="font-medium underline hover:text-amber-700 dark:hover:text-amber-100"
        >
          View states
        </LocalizedClientLink>
      </p>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss shipping notice"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-amber-600 transition hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
