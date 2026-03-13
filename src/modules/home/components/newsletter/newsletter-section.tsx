"use client"

import { useState, useTransition } from "react"
import { useScrollReveal } from "@lib/hooks/use-scroll-reveal"
import { subscribeToNewsletter } from "@lib/data/newsletter"

export default function NewsletterSection() {
  const ref = useScrollReveal<HTMLDivElement>()
  const [email, setEmail] = useState("")
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await subscribeToNewsletter(email)
      setResult(res)
      if (res.success) setEmail("")
    })
  }

  return (
    <section className="px-5 py-20 small:py-28">
      <div
        ref={ref}
        className="scroll-reveal relative mx-auto max-w-lg overflow-hidden rounded-2xl px-6 py-16 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(22,46,36,0.8), rgba(13,40,24,0.8))",
        }}
      >
        {/* Background glow */}
        <div
          className="pointer-events-none absolute -left-[10%] -top-[30%] h-[80%] w-[50%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(244,191,61,0.06), transparent 70%)",
            filter: "blur(40px)",
            animation: "glow-pulse 6s ease-in-out infinite",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          <h2 className="mb-3 text-2xl font-normal text-white small:text-3xl">
            Join the{" "}
            <span className="font-bold text-gold">Collective</span>
          </h2>
          <p className="mb-7 text-sm leading-relaxed text-white/45">
            First access to drops, exclusive offers, and the good stuff
            — straight to your inbox.
          </p>

          {result?.success ? (
            <p className="text-sm font-medium text-teal">{result.message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setResult(null)
                }}
                placeholder="your@email.com"
                required
                className="flex-1 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-colors duration-300 focus:border-teal/40"
              />
              <button
                type="submit"
                disabled={isPending}
                className="whitespace-nowrap rounded-xl bg-gradient-to-r from-teal to-[#0d8a63] px-6 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:brightness-110 disabled:opacity-50"
              >
                {isPending ? "..." : "Join"}
              </button>
            </form>
          )}

          {result && !result.success && (
            <p className="mt-2 text-xs text-tangelo/70">{result.message}</p>
          )}
        </div>
      </div>
    </section>
  )
}
