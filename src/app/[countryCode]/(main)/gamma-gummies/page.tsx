"use client"

import Image from "next/image"
import { useState } from "react"

type Status = { ok: boolean; message: string }

export default function GammaGummiesPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const fd = new FormData(e.currentTarget)
    const payload = {
      email: String(fd.get("email") || "").trim(),
      first_name: String(fd.get("first_name") || "").trim(),
      last_name: String(fd.get("last_name") || "").trim(),
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      setStatus({
        ok: res.ok,
        message:
          data?.message ||
          (res.ok ? "You're signed up!" : "Something went wrong. Please try again."),
      })

      if (res.ok) {
        ;(e.currentTarget as HTMLFormElement).reset()
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
        {/* Brand lockup / title image */}
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
              fontWeight: 800,
              letterSpacing: "-.01em",
              marginBottom: ".25rem",
            }}
          >
            Event Sign‑up
          </h1>
          <p style={{ color: "rgba(255,255,255,.9)" }}>
            Join the launch list. We’ll email you details as we get closer.
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
              placeholder="Calyxandra"
              autoComplete="given-name"
              style={{ padding: ".75rem", borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gap: ".35rem" }}>
            <label htmlFor="last_name">Last name</label>
            <input
              id="last_name"
              name="last_name"
              required
              placeholder="Flora"
              autoComplete="family-name"
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
              placeholder="calyxandra@totalhemp.co"
              autoComplete="email"
              style={{ padding: ".75rem", borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

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
            <p
              role="status"
              aria-live="polite"
              style={{ marginTop: ".25rem", color: status.ok ? "#0a7" : "#b00" }}
            >
              {status.message}
            </p>
          )}
        </form>
      </section>
    </main>
  )
}