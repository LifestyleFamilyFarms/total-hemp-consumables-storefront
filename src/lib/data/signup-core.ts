import "server-only"

import Medusa from "@medusajs/js-sdk"
import { z } from "zod"

const Name = z
  .string()
  .transform((value) => value.replace(/\s+/g, " ").trim())
  .pipe(
    z
      .string()
      .min(1, "Required")
      .max(64, "Too long")
      .refine(
        (value) => /^[A-Za-z\u00C0-\u017F\s.'-]+$/.test(value),
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
        (value) => !value || /^[A-Za-z\u00C0-\u017F\s.'-]+$/.test(value),
        "Only letters, spaces, apostrophes, hyphens, periods"
      )
  )
  .transform((value) => (value.length ? value : undefined))

const Campaign = z.enum(["gamma_gummies_event_2025", "grand_opening_waitlist"])

export type SignupCampaign = z.infer<typeof Campaign>

export const DEFAULT_SIGNUP_SOURCE = "/us/gamma-gummies"

const SignupSchema = z.object({
  email: z.string().max(254).email().transform((email) => email.trim().toLowerCase()),
  first_name: z.union([Name, OptionalName]).optional().transform((value) => value || undefined),
  last_name: z.union([Name, OptionalName]).optional().transform((value) => value || undefined),
  signup_source: z.string().trim().min(1).max(120).optional().default(DEFAULT_SIGNUP_SOURCE),
  campaign: Campaign.optional().default("gamma_gummies_event_2025"),
  hp: z.string().optional().transform((value) => (value ?? "").trim()),
})

class SignupError extends Error {
  status: number

  constructor(message: string, status = 500) {
    super(message)
    this.name = "SignupError"
    this.status = status
  }
}

export { SignupError }

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new SignupError("Unable to complete sign-up at this time.", 500)
  }

  return value
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "")
}

export function getSignupSuccessMessage(campaign: SignupCampaign) {
  if (campaign === "grand_opening_waitlist") {
    return "You're on the list. We'll email you before grand opening."
  }

  return "Signed up! Check your email for confirmation."
}

export async function processSignupPayload(raw: unknown) {
  const parsed = SignupSchema.safeParse(raw)
  if (!parsed.success) {
    throw new SignupError("Invalid input.", 400)
  }

  const { email, first_name, last_name, hp, signup_source, campaign } = parsed.data

  if (hp) {
    return { message: getSignupSuccessMessage(campaign) }
  }

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
  } catch (error: any) {
    if (error?.status === 409 || error?.status === 422) {
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
      throw new SignupError("Unable to complete sign-up at this time.", 500)
    }
  }

  return { message: getSignupSuccessMessage(campaign) }
}
