"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { sdk } from "../../../../lib/medusa-sdk"
import Head from "next/head"

type Status = { ok: boolean; message: string }

export default function GammaGummiesPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(false)

  // Controlled form state (so we can prefill from SDK)
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  })

  // Try to prefill from Medusa Store API if the visitor is logged in.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // Will 401 if not logged in; that's fine—we silently ignore
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
        // not logged in or no store session – ignore
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      const fd= new FormData(e.currentTarget)
      const hp = String(fd.get("hp") || "")
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          hp
        }),
      })

      const data = await res.json().catch(() => ({}))
      const ok = res.ok
      setStatus({
        ok,
        message:
          data?.message || (ok ? "You're signed up!" : "Something went wrong. Please try again."),
      })
      if (ok) {
        setForm({ first_name: "", last_name: "", email: "" })
      }
    } catch (err: any) {
      setStatus({
        ok: false,
        message: err?.message || "Temporarily unavailable. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      {/* Background image from public/disco_biscuits_assets */}
      <Head>
        <link rel="stylesheet" href="https://use.typekit.net/yxe5ahp.css" />
      </Head>
      <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <Image
          src="/disco_biscuits_assets/biscuits_background.png"
          alt="Gamma Gummies background"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      </div>

      {/* Content */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gap: "1.25rem",
          maxWidth: 640,
          margin: "0 auto",
          padding: "min(6vw, 3rem) 1.25rem",
        }}
      >
        {/* Title image */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center" }}>
          <Image
            src="/disco_biscuits_assets/title_with_gummies.png"
            alt="Gamma Gummies"
            width={560}
            height={180}
            style={{ height: "auto", width: "100%", maxWidth: 560 }}
            priority
          />
        </div>

        <header style={{ textAlign: "center" }}>
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(1.75rem, 5vw, 3rem)",
              letterSpacing: "-.01em",
              marginBottom: ".25rem",
              fontFamily: "new-spirit, serif",
              fontWeight: 700,
              fontStyle: "normal",
            }}
          >
            Premiere Event Sign Up
          </h1>
          <p style={{ 
            color: "rgba(255,255,255,.9)",
            fontFamily: "new-spirit-condensed, serif",
            fontWeight: 400,
            fontStyle: "normal",
            }}>
            Join the launch list 🚀
            <br />
            We’ll email you details as we get closer
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          style={{
            display: "grid",
            gap: ".75rem",
            background: "rgba(255,255,255,.97)",
            borderRadius: 12,
            padding: "1rem",
            boxShadow: "0 8px 24px rgba(0,0,0,.25)",
          }}
        >
          <div style={{ display: "grid", gap: ".35rem" }}>
            <label htmlFor="first_name">First name</label>
            <input
              id="first_name"
              name="first_name"
              required
              placeholder="Please enter your first name"
              autoComplete="given-name"
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              style={{ padding: ".75rem", borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gap: ".35rem" }}>
            <label htmlFor="last_name">Last name</label>
            <input
              id="last_name"
              name="last_name"
              required
              placeholder="Please enter your last name"
              autoComplete="family-name"
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              style={{ padding: ".75rem", borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gap: ".35rem" }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Please enter your email address"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              style={{ padding: ".75rem", borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

            <input
              type="text"
              name="hp"
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
              style={{ position: "absolute", left: "-10000px", opacity: 0, height: 0, width: 0 }}
            />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: ".25rem",
              padding: ".9rem 1rem",
              borderRadius: 10,
              border: "1px solid #000",
              background: "#000",
              color: "#fff",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Submitting..." : "Sign me up"}
          </button>

          {status && (
            <p role="status" aria-live="polite" style={{ marginTop: ".25rem", color: status.ok ? "#0a7" : "#b00" }}>
              {status.message}
            </p>
          )}
        </form>
      </section>
    </main>
  )
}