const c = require("ansi-colors")

// Allow environment-specific keys and backend URLs, and populate public vars
// Priority for publishable key:
// - development: MEDUSA_DEV_PUBLISHABLE_KEY → NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
// - production: MEDUSA_PROD_PUBLISHABLE_KEY → NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
// - generic fallback: MEDUSA_PUBLISHABLE_KEY
// Priority for backend URL:
// - development: MEDUSA_DEV_BACKEND_URL → NEXT_PUBLIC_MEDUSA_BACKEND_URL and MEDUSA_BACKEND_URL
// - production: MEDUSA_PROD_BACKEND_URL → NEXT_PUBLIC_MEDUSA_BACKEND_URL and MEDUSA_BACKEND_URL
// - fallback: MEDUSA_BACKEND_URL

const NODE_ENV = process.env.NODE_ENV || "development"

function isLocalhostUrl(url) {
  if (!url) return false

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

if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
  if (NODE_ENV === "development" && process.env.MEDUSA_DEV_PUBLISHABLE_KEY) {
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY =
      process.env.MEDUSA_DEV_PUBLISHABLE_KEY
  } else if (NODE_ENV === "production" && process.env.MEDUSA_PROD_PUBLISHABLE_KEY) {
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY =
      process.env.MEDUSA_PROD_PUBLISHABLE_KEY
  } else if (process.env.MEDUSA_PUBLISHABLE_KEY) {
    // generic fallback if provided
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY =
      process.env.MEDUSA_PUBLISHABLE_KEY
  }
}

const requiredEnvs = [
  {
    key: "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    description:
      "Learn how to create a publishable key: https://docs.medusajs.com/v2/resources/storefront-development/publishable-api-keys",
  },
  {
    key: "NEXT_PUBLIC_MEDUSA_BACKEND_URL",
    description:
      "Set your Medusa backend URL. In dev, MEDUSA_DEV_BACKEND_URL can populate this automatically.",
  },
]

// Populate backend URLs if not set
function normalizeBase(url) {
  if (!url) return url
  return url.replace(/\/+$/, "")
}

if (!process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  if (NODE_ENV === "development" && process.env.MEDUSA_DEV_BACKEND_URL) {
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL = normalizeBase(process.env.MEDUSA_DEV_BACKEND_URL)
  } else if (NODE_ENV === "production" && process.env.MEDUSA_PROD_BACKEND_URL) {
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL = normalizeBase(process.env.MEDUSA_PROD_BACKEND_URL)
  } else if (process.env.MEDUSA_BACKEND_URL) {
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL = normalizeBase(process.env.MEDUSA_BACKEND_URL)
  } else if (NODE_ENV === "development") {
    // last-resort sensible default for local dev
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL = "http://localhost:9000"
  }
}

// Ensure server-side SDK also has MEDUSA_BACKEND_URL when missing
if (!process.env.MEDUSA_BACKEND_URL) {
  if (NODE_ENV === "development" && process.env.MEDUSA_DEV_BACKEND_URL) {
    process.env.MEDUSA_BACKEND_URL = normalizeBase(process.env.MEDUSA_DEV_BACKEND_URL)
  } else if (NODE_ENV === "production" && process.env.MEDUSA_PROD_BACKEND_URL) {
    process.env.MEDUSA_BACKEND_URL = normalizeBase(process.env.MEDUSA_PROD_BACKEND_URL)
  } else if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
    process.env.MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  }
}

if (NODE_ENV === "production") {
  if (isLocalhostUrl(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)) {
    console.error(
      c.red.bold(
        "\n🚫 Error: NEXT_PUBLIC_MEDUSA_BACKEND_URL points to localhost in production.\n"
      )
    )
    process.exit(1)
  }

  if (isLocalhostUrl(process.env.MEDUSA_BACKEND_URL)) {
    console.error(
      c.red.bold(
        "\n🚫 Error: MEDUSA_BACKEND_URL points to localhost in production.\n"
      )
    )
    process.exit(1)
  }
}

function checkEnvVariables() {
  const missingEnvs = requiredEnvs.filter(function (env) {
    return !process.env[env.key]
  })

  if (missingEnvs.length > 0) {
    console.error(
      c.red.bold("\n🚫 Error: Missing required environment variables\n")
    )

    missingEnvs.forEach(function (env) {
      console.error(c.yellow(`  ${c.bold(env.key)}`))
      if (env.description) {
        console.error(c.dim(`    ${env.description}\n`))
      }
    })

    console.error(
      c.yellow(
        "\nPlease set these variables in your .env file or environment before starting the application.\n"
      )
    )

    process.exit(1)
  }
}

module.exports = checkEnvVariables
