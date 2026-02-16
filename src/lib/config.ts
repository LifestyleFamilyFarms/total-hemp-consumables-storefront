import Medusa from "@medusajs/js-sdk"

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "")
const isLocalhostUrl = (url: string) => {
  try {
    const { hostname } = new URL(url)
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".localhost")
    )
  } catch {
    return false
  }
}

const resolveBackendUrl = () => {
  const url =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    process.env.MEDUSA_BACKEND_URL

  if (url) {
    const normalized = normalizeBaseUrl(url)

    if (process.env.NODE_ENV === "production" && isLocalhostUrl(normalized)) {
      throw new Error(
        "Invalid Medusa backend URL in production. NEXT_PUBLIC_MEDUSA_BACKEND_URL cannot point to localhost."
      )
    }

    return normalized
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:9000"
  }

  throw new Error(
    "Missing Medusa backend URL. Set NEXT_PUBLIC_MEDUSA_BACKEND_URL in production."
  )
}

const MEDUSA_BACKEND_URL = resolveBackendUrl()

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
