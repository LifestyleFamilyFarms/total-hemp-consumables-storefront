/**
 * Maps Authorize.Net response/reason codes to user-friendly messages.
 * See: https://developer.authorize.net/api/reference/responseCodes.html
 */
const ANET_ERROR_MAP: Record<string, string> = {
  "2": "Your card was declined. Please try another card or contact your bank.",
  "3": "There was an error processing your card. Please try again.",
  "4": "Your card has been flagged for review. Please try another card.",
  "6": "Invalid card number. Please double-check and try again.",
  "7": "Your card has expired. Please use a different card.",
  "8": "Your card has expired. Please use a different card.",
  "11": "This transaction was already submitted. Please refresh and try again.",
  "27": "Address verification failed. Please check your billing address.",
  "44": "CVV mismatch. Please check the security code on your card.",
  "45": "AVS and CVV check failed. Please verify your card details.",
  "65": "Your card has exceeded its credit limit.",
  "78": "Invalid CVV. Please check the 3-digit code on the back of your card.",
  "152": "Transaction pending review. Please wait or try another card.",
  "253": "Transaction could not be processed. Please try another card.",
}

/**
 * Parses a raw payment error (from Authorize.Net via Medusa) and returns
 * a customer-friendly message. Tries code extraction first, then keyword
 * fallback, then generic message.
 */
export function mapPaymentError(rawError: string | null | undefined): string {
  if (!rawError) {
    return "Payment could not be processed. Please try again."
  }

  // Try to extract ANET response code from error message
  const codeMatch =
    rawError.match(/response_code[=:]\s*(\d+)/i) ??
    rawError.match(/code[=:]\s*["']?(\d+)/i) ??
    rawError.match(/E(\d{5})/i)

  if (codeMatch) {
    const mapped = ANET_ERROR_MAP[codeMatch[1]]
    if (mapped) return mapped
  }

  // Keyword fallback for errors without codes
  const lower = rawError.toLowerCase()
  if (lower.includes("decline")) return ANET_ERROR_MAP["2"]
  if (lower.includes("expired")) return ANET_ERROR_MAP["7"]
  if (lower.includes("cvv") || lower.includes("security code"))
    return ANET_ERROR_MAP["78"]
  if (lower.includes("insufficient")) return ANET_ERROR_MAP["65"]

  return "Payment could not be processed. Please try again or use a different card."
}
