"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitGammaSignup, type SignupActionState } from "@lib/data/signup"
import { cn } from "@lib/utils"

type GammaSignupCardProps = {
  id?: string
  signupSource?: string
  initialValues?: {
    first_name?: string | null
    last_name?: string | null
    email?: string | null
  }
}

export default function GammaSignupCard({
  id = "gamma-signup",
  signupSource = "/us/gamma-gummies",
  initialValues,
}: GammaSignupCardProps) {
  const [status, formAction, isPending] = useActionState<SignupActionState, FormData>(
    submitGammaSignup,
    null
  )

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
          <form action={formAction} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="signup_source" value={signupSource} />
            <Input
              name="hp"
              autoComplete="off"
              tabIndex={-1}
              className="absolute left-[-9999px] top-auto h-0 w-0 border-0 p-0 opacity-0"
              aria-hidden
            />
            <div className="grid gap-2">
              <Label htmlFor="gamma-first">First name</Label>
              <Input
                id="gamma-first"
                name="first_name"
                defaultValue={initialValues?.first_name ?? ""}
                placeholder="Disco"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gamma-last">Last name</Label>
              <Input
                id="gamma-last"
                name="last_name"
                defaultValue={initialValues?.last_name ?? ""}
                placeholder="Biscuits"
                required
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="gamma-email">Email</Label>
              <Input
                id="gamma-email"
                name="email"
                type="email"
                defaultValue={initialValues?.email ?? ""}
                placeholder="you@email.com"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                {isPending ? "Joining..." : "Notify me"}
              </Button>
              {status?.message ? (
                <p className={cn("mt-3 text-xs", status.success ? "text-foreground/80" : "text-destructive")}>
                  {status.message}
                </p>
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
