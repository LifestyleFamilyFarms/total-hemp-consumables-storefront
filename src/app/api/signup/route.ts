import type { NextRequest } from "next/server"
import Medusa from "@medusajs/js-sdk"
import { z } from "zod"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function ok(message: string) {
  return Response.json({ success: true, message }, { status: 200 })
}
function bad(message: string, code = 400) {
  return Response.json({ success: false, message }, { status: code })
}
function requiredEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env: ${name}`)
  return v
}
function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "")
}

// Very small in-memory rate limiter (per runtime instance) to reduce abuse
// of the signup endpoint. For robust limits, use an external store (Redis).
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = Number(process.env.SIGNUP_RATE_LIMIT ?? 10)
type Entry = { count: number; resetAt: number }
const rateMap = new Map<string, Entry>()

function getClientIp(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for") || ""
  const ip = xff.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anon"
  return ip
}

function checkRate(req: NextRequest) {
  const ip = getClientIp(req)
  const now = Date.now()
  const cur = rateMap.get(ip)
  if (!cur || now > cur.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (cur.count >= RATE_LIMIT_MAX) return false
  cur.count += 1
  return true
}

// Friendly constraints and normalization
const Name = z
  .string()
  .transform((s) => s.replace(/\s+/g, " ").trim())
  .pipe(
    z
      .string()
      .min(1, "Required")
      .max(64, "Too long")
      .refine(
        // Basic A–Z plus common accented Latin letters, spaces, apostrophe, hyphen, period
        (s) => /^[A-Za-z\u00C0-\u017F\s.'-]+$/.test(s),
        "Only letters, spaces, apostrophes, hyphens, periods"
      )
  )

const SignupSchema = z.object({
  email: z.string().max(254).email().transform((e) => e.trim().toLowerCase()),
  first_name: Name,
  last_name: Name,
  hp: z.string().optional().transform((v) => (v ?? "").trim()), // honeypot
})

export async function POST(req: NextRequest) {
  try {
    if (!checkRate(req)) {
      return new Response(
        JSON.stringify({ success: false, message: "Too many requests. Please try again shortly." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": "60" },
        }
      )
    }
    // Optional origin allow-list in prod
    const origin = req.headers.get("origin") || ""
    const allowed = (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    if (process.env.NODE_ENV === "production" && allowed.length && origin && !allowed.includes(origin)) {
      return bad("Forbidden", 403)
    }

    const raw = await req.json()
    const parsed = SignupSchema.safeParse(raw)
    if (!parsed.success) return bad("Invalid input.", 400)
    const { email, first_name, last_name, hp } = parsed.data

    // Honeypot hit → pretend success, but no-op
    if (hp) return ok("Signed up! Check your email for confirmation.")

    const sdk = new Medusa({
      baseUrl: normalizeBaseUrl(requiredEnv("MEDUSA_BACKEND_URL")),
      apiKey: requiredEnv("MEDUSA_ADMIN_TOKEN"),
    })

    try {
      await sdk.admin.customer.create({
        email,
        first_name,
        last_name,
        metadata: {
          gamma_gummies_event_2025: true,
          signup_source: "/us/gamma-gummies",
        },
      })
    } catch (e: any) {
      if (e?.status === 409 || e?.status === 422) {
        const { customers } = await sdk.admin.customer.list({ q: email, limit: 1 })
        const id = customers?.[0]?.id
        if (id) {
          await sdk.admin.customer.update(id, {
            metadata: { gamma_gummies_event_2025: true },
          })
        }
      } else {
        throw e
      }
    }

    // Email will be sent by Medusa Notification subscribers
    return ok("Signed up! Check your email for confirmation.")
  } catch {
    return bad("Unable to complete sign‑up at this time.", 500)
  }
}
