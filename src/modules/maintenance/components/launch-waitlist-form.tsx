"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const CAMPAIGN = "grand_opening_waitlist" as const
const SIGNUP_SOURCE = "/maintenance"

type StatusState = {
  ok: boolean
  message: string
} | null

export default function LaunchWaitlistForm() {
  const [email, setEmail] = useState("")
  const [hp, setHp] = useState("")
  const [status, setStatus] = useState<StatusState>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)

    startTransition(async () => {
      try {
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            campaign: CAMPAIGN,
            signup_source: SIGNUP_SOURCE,
            hp,
          }),
        })

        const payload = await response.json().catch(() => ({}))
        const message =
          payload?.message ||
          (response.ok
            ? "You're on the list. We'll email you before Grand Opening."
            : "Unable to join the alert list right now. Please try again.")

        setStatus({ ok: response.ok, message })

        if (response.ok) {
          setEmail("")
          setHp("")
        }
      } catch {
        setStatus({
          ok: false,
          message: "Unable to join the alert list right now. Please try again.",
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="maintenance-email" className="text-sm font-medium text-foreground/80">
          Email Address
        </label>
        <Input
          id="maintenance-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="h-11 border-border/70 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] placeholder:text-foreground/45 focus-visible:ring-primary/45"
          required
        />
      </div>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="maintenance-company">Company</label>
        <input
          id="maintenance-company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(event) => setHp(event.target.value)}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : "Notify Me at Grand Opening"}
      </Button>

      {status ? (
        <p className={`text-xs ${status.ok ? "text-foreground/70" : "text-destructive"}`}>{status.message}</p>
      ) : null}

      <p className="text-[11px] leading-relaxed text-foreground/60">
        By joining this list, you confirm you are 21+ and agree to receive launch updates about Total Hemp
        Consumables products.
      </p>
    </form>
  )
}
