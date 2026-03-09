import { sdk } from "@lib/config"
import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "node:crypto"

type RecoveryTokenPayload = {
  v: number
  cart_id: string
  iat: number
  exp: number
}

const getCountryCodeFromPath = (pathname: string): string | null => {
  const parts = pathname.split("/").filter(Boolean)
  return parts[0] || null
}

const getRecoverySecret = (): string =>
  (process.env.SENDGRID_ABANDONED_CART_RECOVERY_SECRET || "").trim()

const getCartPath = (request: NextRequest): string => {
  const countryCode = getCountryCodeFromPath(request.nextUrl.pathname)
  if (!countryCode) {
    return "/cart"
  }
  return `/${countryCode}/cart`
}

const safeJsonParse = (value: string): RecoveryTokenPayload | null => {
  try {
    const parsed = JSON.parse(value) as Partial<RecoveryTokenPayload>

    if (
      parsed.v !== 1 ||
      typeof parsed.cart_id !== "string" ||
      !parsed.cart_id.trim() ||
      typeof parsed.exp !== "number" ||
      !Number.isFinite(parsed.exp)
    ) {
      return null
    }

    return {
      v: 1,
      cart_id: parsed.cart_id.trim(),
      iat: typeof parsed.iat === "number" && Number.isFinite(parsed.iat) ? parsed.iat : 0,
      exp: parsed.exp,
    }
  } catch {
    return null
  }
}

const verifySignature = (
  encodedPayload: string,
  providedSignature: string,
  secret: string
): boolean => {
  const expectedSignature = createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url")

  const providedBuffer = Buffer.from(providedSignature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (providedBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(providedBuffer, expectedBuffer)
}

const parseRecoveryToken = (
  token: string,
  secret: string
): RecoveryTokenPayload | null => {
  const [encodedPayload, signature] = token.split(".")
  if (!encodedPayload || !signature) {
    return null
  }

  if (!verifySignature(encodedPayload, signature, secret)) {
    return null
  }

  let payloadValue: string
  try {
    payloadValue = Buffer.from(encodedPayload, "base64url").toString("utf8")
  } catch {
    return null
  }

  return safeJsonParse(payloadValue)
}

const isExpired = (exp: number): boolean => {
  const nowSeconds = Math.floor(Date.now() / 1000)
  return exp <= nowSeconds
}

const cartExists = async (cartId: string): Promise<boolean> => {
  try {
    const response = await sdk.store.cart.retrieve(cartId)
    return Boolean(response.cart?.id)
  } catch {
    return false
  }
}

const redirectToCart = (request: NextRequest): NextResponse =>
  NextResponse.redirect(new URL(getCartPath(request), request.url), 307)

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || ""
  const secret = getRecoverySecret()

  if (!token || !secret) {
    return redirectToCart(request)
  }

  const payload = parseRecoveryToken(token, secret)
  if (!payload || isExpired(payload.exp)) {
    return redirectToCart(request)
  }

  const exists = await cartExists(payload.cart_id)
  if (!exists) {
    return redirectToCart(request)
  }

  const response = redirectToCart(request)
  response.cookies.set("_medusa_cart_id", payload.cart_id, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
  return response
}
