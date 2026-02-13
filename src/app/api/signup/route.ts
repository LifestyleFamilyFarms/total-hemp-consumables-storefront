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

const OptionalName = z
  .string()
  .optional()
  .transform((value) => (value ?? "").replace(/\s+/g, " ").trim())
  .pipe(
    z
      .string()
      .max(64, "Too long")
      .refine(
        // Basic A–Z plus common accented Latin letters, spaces, apostrophe, hyphen, period
        (s) => !s || /^[A-Za-z\u00C0-\u017F\s.'-]+$/.test(s),
        "Only letters, spaces, apostrophes, hyphens, periods"
      )
  )
  .transform((value) => (value.length ? value : undefined))

const Campaign = z.enum(["gamma_gummies_event_2025", "grand_opening_waitlist"])
const DEFAULT_SIGNUP_SOURCE = "/us/gamma-gummies"

const SignupSchema = z.object({
  email: z.string().max(254).email().transform((e) => e.trim().toLowerCase()),
  first_name: z.union([Name, OptionalName]).optional().transform((value) => value || undefined),
  last_name: z.union([Name, OptionalName]).optional().transform((value) => value || undefined),
  signup_source: z.string().trim().min(1).max(120).optional().default(DEFAULT_SIGNUP_SOURCE),
  campaign: Campaign.optional().default("gamma_gummies_event_2025"),
  hp: z.string().optional().transform((v) => (v ?? "").trim()), // honeypot
})

function successMessage(campaign: z.infer<typeof Campaign>) {
  if (campaign === "grand_opening_waitlist") {
    return "You're on the list. We'll email you before grand opening."
  }
  return "Signed up! Check your email for confirmation."
}

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
    const { email, first_name, last_name, hp, signup_source, campaign } = parsed.data

    // Honeypot hit → pretend success, but no-op
    if (hp) return ok(successMessage(campaign))

    const sdk = new Medusa({
      baseUrl: normalizeBaseUrl(requiredEnv("MEDUSA_BACKEND_URL")),
      apiKey: requiredEnv("MEDUSA_ADMIN_TOKEN"),
    })

    const metadataPatch: Record<string, unknown> = {
      signup_source,
      [campaign]: true,
    }

    try {
      const createPayload: {
        email: string
        first_name?: string
        last_name?: string
        metadata: Record<string, unknown>
      } = {
        email,
        metadata: metadataPatch,
      }

      if (first_name) createPayload.first_name = first_name
      if (last_name) createPayload.last_name = last_name

      await sdk.admin.customer.create(createPayload)
    } catch (e: any) {
      if (e?.status === 409 || e?.status === 422) {
        const { customers } = await sdk.admin.customer.list({
          q: email,
          limit: 1,
          fields: "id,metadata",
        })
        const existingCustomer = customers?.[0]
        const id = existingCustomer?.id

        if (id) {
          const existingMetadata =
            existingCustomer?.metadata && typeof existingCustomer.metadata === "object"
              ? (existingCustomer.metadata as Record<string, unknown>)
              : {}
          const updatePayload: {
            first_name?: string
            last_name?: string
            metadata: Record<string, unknown>
          } = {
            metadata: {
              ...existingMetadata,
              ...metadataPatch,
            },
          }

          if (first_name) updatePayload.first_name = first_name
          if (last_name) updatePayload.last_name = last_name

          await sdk.admin.customer.update(id, updatePayload)
        }
      } else {
        throw e
      }
    }

    // Email will be sent by Medusa Notification subscribers
    return ok(successMessage(campaign))
  } catch {
    return bad("Unable to complete sign-up at this time.", 500)
  }
}
