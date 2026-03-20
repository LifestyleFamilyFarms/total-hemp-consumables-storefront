"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@lib/utils"
import { BLOCKED_SHIPPING_STATE_CODES, ALLOWED_SHIPPING_STATES, blockedStateName } from "@lib/constants/shipping"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const STORAGE_KEY = "thc_age_verified"
const MAX_AGE_DAYS = 30

const getExpiry = () => Date.now() + MAX_AGE_DAYS * 24 * 60 * 60 * 1000

const hasQaBypass = () => {
  if (typeof window === "undefined") {
    return false
  }

  if (process.env.NODE_ENV === "production") {
    return false
  }

  const searchParams = new URLSearchParams(window.location.search)
  return searchParams.get("qa_age_verified") === "1"
}

const readStoredTimestamp = () => {
  if (typeof window === "undefined") return null
  const stored = window.localStorage.getItem(STORAGE_KEY)
  const parsed = stored ? Number(stored) : NaN
  return Number.isFinite(parsed) ? parsed : null
}

const writeStoredTimestamp = (timestamp: number) => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, String(timestamp))
  const maxAge = Math.floor(MAX_AGE_DAYS * 24 * 60 * 60)
  document.cookie = `${STORAGE_KEY}=${timestamp}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
}

function getGeoRegion(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/(?:^|;\s*)geo_region=([A-Z]{2})/)
  return match?.[1] ?? null
}

type AgeGateProps = {
  className?: string
}

export default function AgeGate({ className }: AgeGateProps) {
  const [open, setOpen] = useState(false)
  const [showGeoNotice, setShowGeoNotice] = useState(false)
  const [geoState, setGeoState] = useState<string | null>(null)
  const confirmRef = useRef<HTMLButtonElement | null>(null)

  const shouldShow = useMemo(() => {
    if (hasQaBypass()) {
      const expiry = getExpiry()
      writeStoredTimestamp(expiry)
      return false
    }

    const stored = readStoredTimestamp()
    if (!stored) return true
    return stored < Date.now()
  }, [])

  const handleAgeConfirm = () => {
    writeStoredTimestamp(getExpiry())
    const region = getGeoRegion()
    if (region && BLOCKED_SHIPPING_STATE_CODES.has(region)) {
      setGeoState(blockedStateName(region) ?? region)
      setShowGeoNotice(true)
    } else {
      setOpen(false)
    }
  }

  useEffect(() => {
    if (shouldShow) {
      setOpen(true)
    }
  }, [shouldShow])

  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 text-foreground",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-description"
    >
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-background p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.4em] text-foreground/60">
          Age Verification
        </p>
        <h2 id="age-gate-title" className="mt-3 text-2xl font-semibold">
          Are you 21 or older?
        </h2>
        <p id="age-gate-description" className="mt-2 text-sm text-foreground/70">
          Please confirm your age to enter the store.
        </p>
        {!showGeoNotice && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              ref={confirmRef}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              onClick={handleAgeConfirm}
            >
              Yes, I am 21+
            </button>
            <a
              className="rounded-lg border border-border px-4 py-2 text-center text-sm font-semibold text-foreground/70 transition hover:bg-muted"
              href="https://www.google.com"
              rel="noopener noreferrer"
            >
              No, take me back
            </a>
          </div>
        )}
        {showGeoNotice && geoState && (
          <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/50" role="alert">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Shipping notice
            </p>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
              We&apos;re unable to ship hemp products to {geoState} due to state
              regulations. You can still shop and ship to friends or family in any
              of our {ALLOWED_SHIPPING_STATES.length} approved states.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                onClick={() => setOpen(false)}
              >
                Continue browsing
              </button>
              <LocalizedClientLink
                href="/content/shipping-returns"
                className="text-sm font-medium text-amber-700 underline hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200"
                onClick={() => setOpen(false)}
              >
                View shipping states →
              </LocalizedClientLink>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
