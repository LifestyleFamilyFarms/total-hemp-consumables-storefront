// src/app/api/signup/route.ts
import type { NextRequest } from "next/server"
import Medusa from "@medusajs/js-sdk"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Payload = { email?: string; first_name?: string; last_name?: string }

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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Payload
    const email = (body.email || "").trim().toLowerCase()
    const first_name = (body.first_name || "").trim()
    const last_name = (body.last_name || "").trim()
    if (!email || !first_name || !last_name) return bad("Missing required fields.")

    const sdk = new Medusa({
      baseUrl: normalizeBaseUrl(requiredEnv("MEDUSA_BACKEND_URL")),
      apiKey: requiredEnv("MEDUSA_ADMIN_TOKEN"), // Admin Secret API Key (server-only)
    })

    // Try create; if exists, tag it
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

    // Email is sent from Medusa (Notification module subscriber), not here.
    return ok("Signed up! Check your email for confirmation.")
  } catch {
    return bad("Unable to complete sign‑up at this time.", 500)
  }
}