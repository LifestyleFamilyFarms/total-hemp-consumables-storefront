import type { NextRequest } from "next/server"
import { processSignupPayload, SignupError } from "@lib/data/signup-core"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function ok(message: string) {
  return Response.json({ success: true, message }, { status: 200 })
}
function bad(message: string, code = 400) {
  return Response.json({ success: false, message }, { status: code })
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
    const { message } = await processSignupPayload(raw)

    return ok(message)
  } catch (error) {
    if (error instanceof SignupError) {
      return bad(error.message, error.status)
    }

    return bad("Unable to complete sign-up at this time.", 500)
  }
}
