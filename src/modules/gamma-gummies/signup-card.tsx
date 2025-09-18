"use client"

import { useEffect, useState, useTransition } from "react"

import { sdk } from "@lib/medusa-sdk"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@lib/utils"

export default function GammaSignupCard({ id = "gamma-signup" }: { id?: string }) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "" })
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const me: any = await (sdk as any).store.customer.me()
        const customer = me?.customer ?? me
        if (!cancelled && customer) {
          setForm((prev) => ({
            first_name: customer.first_name || prev.first_name,
            last_name: customer.last_name || prev.last_name,
            email: customer.email || prev.email,
          }))
        }
      } catch {
        // not authenticated—ignore
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function handleChange(field: "first_name" | "last_name" | "email") {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus(null)

    startTransition(async () => {
      try {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form }),
        })
        const payload = await res.json().catch(() => ({}))
        if (res.ok) {
          setForm({ first_name: "", last_name: "", email: "" })
        }
        setStatus({ ok: res.ok, message: payload?.message || (res.ok ? "You're on the list." : "Unable to join right now."), })
      } catch {
        setStatus({ ok: false, message: "Unable to submit right now. Please try again." })
      }
    })
  }

  return (
    <section id={id} className="mx-auto w-full max-w-3xl px-6 pb-24 sm:px-10">
      <Card className="border border-border/60 bg-background/90 shadow-[0_24px_48px_rgba(15,23,42,0.18)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">Join the Gamma Gummies premiere</CardTitle>
          <CardDescription className="text-sm text-foreground/70">
            Be first in line for allocation details, lab reports, and exclusive launch events. We only send what matters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="gamma-first">First name</Label>
              <Input
                id="gamma-first"
                value={form.first_name}
                onChange={handleChange("first_name")}
                placeholder="Disco"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gamma-last">Last name</Label>
              <Input
                id="gamma-last"
                value={form.last_name}
                onChange={handleChange("last_name")}
                placeholder="Biscuits"
                required
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="gamma-email">Email</Label>
              <Input
                id="gamma-email"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="you@email.com"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                {isPending ? "Joining..." : "Notify me"}
              </Button>
              {status ? (
                <p className={cn("mt-3 text-xs", status.ok ? "text-foreground/80" : "text-destructive")}>{status.message}</p>
              ) : null}
              <p className="mt-3 text-[11px] text-foreground/60">
                By signing up you confirm you are 21+ and agree to receive emails about Gamma Gummies, future drops, and compliance updates.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
