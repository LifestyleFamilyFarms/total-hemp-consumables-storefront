"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NewsletterSignup() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)

    startTransition(async () => {
      try {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ first_name: firstName, last_name: lastName, email }),
        })
        const payload = await res.json()
        setMessage(payload?.message ?? (res.ok ? "Thanks for joining the drop list." : "Something went wrong."))
        if (res.ok) {
          setFirstName("")
          setLastName("")
          setEmail("")
        }
      } catch (err) {
        setMessage("Unable to submit right now. Please retry shortly.")
      }
    })
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-20 sm:px-10">
      <div className="rounded-[24px] border border-border/50 bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-8 shadow-[0_24px_48px_rgba(15,23,42,0.15)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/30 sm:p-12">
        <div className="flex flex-col gap-6 text-center sm:flex-row sm:items-center sm:gap-10 sm:text-left">
          <div className="flex-1 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">Drop alerts</p>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Be first to know about new cultivars, lab updates, and flash drops.
            </h3>
            <p className="text-sm text-foreground/70">
              We only send what matters—no spam, just harvest news, education, and exclusive inventory previews.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="first-name" className="sr-only">
                  First name
                </label>
                <Input
                  id="first-name"
                  placeholder="First name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="last-name" className="sr-only">
                  Last name
                </label>
                <Input
                  id="last-name"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isPending}>
              {isPending ? "Joining..." : "Join the drop list"}
            </Button>
            {message ? <p className="text-xs text-foreground/70">{message}</p> : null}
          </form>
        </div>
      </div>
    </section>
  )
}
