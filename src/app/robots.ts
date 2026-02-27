import type { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "")

export default function robots(): MetadataRoute.Robots {
  const baseUrl = normalizeBaseUrl(getBaseURL())

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/*/account", "/*/checkout"],
      },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`],
    host: baseUrl,
  }
}
