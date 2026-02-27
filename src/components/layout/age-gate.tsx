"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@lib/utils"

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

type AgeGateProps = {
  className?: string
}

export default function AgeGate({ className }: AgeGateProps) {
  const [open, setOpen] = useState(false)
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
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            ref={confirmRef}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            onClick={() => {
              writeStoredTimestamp(getExpiry())
              setOpen(false)
            }}
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
      </div>
    </div>
  )
}
