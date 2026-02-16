import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

function normalizePath(pathname: string) {
  if(!pathname) return "/"
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname
}

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: [`regions-${cacheId}`],
      },
      cache: "force-cache",
    }).then(async (response) => {
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.message)
      }

      return json
    })

    if (!regions?.length) {
      throw new Error(
        "No regions found. Please set up regions in your Medusa Admin."
      )
    }

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      )
    }
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  const NONCE = crypto.randomUUID().replace(/-/g, "")
  const isProd = process.env.NODE_ENV === "production"
  const AUTHNET = isProd ? "https://js.authorize.net" : "https://jstest.authorize.net"
  const BACKEND = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || BACKEND_URL || ""

  const hostname = request.nextUrl.hostname
  const origin = request.nextUrl.origin

  const isLocalDev =
    !isProd &&
    (hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".localhost"))

  let backendOrigin: string | undefined
  try {
    backendOrigin = BACKEND ? new URL(BACKEND).origin : undefined
  } catch {
    backendOrigin = undefined
  }

  const scriptSrc = new Set<string>([
    "'self'",
    AUTHNET,
    `'nonce-${NONCE}'`,
  ])

  if (isProd) {
    scriptSrc.add("https://va.vercel-scripts.com")
  }

  if (isLocalDev) {
    scriptSrc.add("'unsafe-eval'")
  }

  const connectSrc = new Set<string>(["'self'"])

  if (backendOrigin) {
    connectSrc.add(backendOrigin)
  } else if (BACKEND) {
    connectSrc.add(BACKEND)
  }

  connectSrc.add(origin)
  connectSrc.add(AUTHNET)

  if (isLocalDev) {
    connectSrc.add("ws:")
    connectSrc.add("http://localhost:8000")
    connectSrc.add("http://127.0.0.1:8000")
  }

  const cspParts = [
    "default-src 'self'",
    `script-src ${Array.from(scriptSrc).join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://use.typekit.net https://p.typekit.net",
    "style-src 'self' 'unsafe-inline' https://use.typekit.net https://p.typekit.net",
    `connect-src ${Array.from(connectSrc).join(" ")}`,
    `frame-src ${AUTHNET}`,
    "form-action 'self'",
  ]
  const CSP_HEADER = isProd ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only"
  const CSP_VALUE = cspParts.join("; ")

  const setSecurityHeaders = (response: NextResponse) => {
    response.headers.set("x-csp-nonce", NONCE)
    response.headers.set("x-nonce", NONCE)
    response.headers.set(CSP_HEADER, CSP_VALUE)
    return response
  }

  const nextWithSecurityHeaders = () => {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-csp-nonce", NONCE)
    requestHeaders.set("x-nonce", NONCE)

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    return setSecurityHeaders(response)
  }

  const MAINTENANCE_ENABLED = process.env.MAINTENANCE_MODE === "1" || process.env.MAINTENANCE_MODE === "true"

  if (MAINTENANCE_ENABLED) {
    const maintenancePath = normalizePath("/maintenance")
    const allowRaw = process.env.ALLOWED_PATHS || maintenancePath

    const allowed = new Set(
      allowRaw
        .split(",")
        .map((s) => normalizePath(s.trim()))
        .filter(Boolean)
    )
    allowed.add(maintenancePath)

    const reqPath = normalizePath(request.nextUrl.pathname)

    if (!allowed.has(reqPath)) {
      const url = request.nextUrl.clone()
      const fallback = Array.from(allowed)[0] || maintenancePath
      url.pathname = fallback || maintenancePath
      url.search = ""
      return setSecurityHeaders(NextResponse.redirect(url, 307))
    }

    if (reqPath === maintenancePath) {
      return nextWithSecurityHeaders()
    }
  }

  const repCode = request.nextUrl.searchParams.get("rep")?.trim() || ""
  const isGammaGummies =
    request.nextUrl.pathname.includes("/gamma-gummies") ||
    request.nextUrl.pathname.endsWith("/gamma-gummies")
  const withRepCookie = (res: NextResponse) => {
    if (repCode && !isGammaGummies) {
      res.cookies.set("_sales_rep", repCode, {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
    }
    return res
  }

  let redirectUrl = request.nextUrl.href

  let response = NextResponse.redirect(redirectUrl, 307)

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")

  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

  // if one of the country codes is in the url and the cache id is set, return next
  if (urlHasCountryCode && cacheIdCookie) {
    const res = nextWithSecurityHeaders()
    return withRepCookie(res)
  }

  // if one of the country codes is in the url and the cache id is not set, set the cache id and redirect
  if (urlHasCountryCode && !cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })

    setSecurityHeaders(response)
    return withRepCookie(response)
  }

  // check if the url is a static asset
  if (request.nextUrl.pathname.includes(".")) {
    const res = nextWithSecurityHeaders()
    return withRepCookie(res)
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  }

  setSecurityHeaders(response)
  return withRepCookie(response)
}

// export const config = {
//   matcher: [
//     "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
//   ],
// }

export const config = {
  matcher: [
    // Skip Next internals, API routes, your public assets folder,
    // and any request for common static file extensions.
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|disco_biscuits_assets|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|css|js|map|woff2?|ttf|json)).*)",
  ],
}
