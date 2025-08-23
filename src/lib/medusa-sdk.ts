import Medusa from "@medusajs/js-sdk"

const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export const sdk = new Medusa({
    baseUrl: baseUrl || "",
    // For Store API calls (client-side), the SDK uses the publishable key automatically.
    publishableKey: publishableKey || undefined,
  })