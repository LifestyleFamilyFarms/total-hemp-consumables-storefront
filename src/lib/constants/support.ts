const defaultSupportEmail = "support@totalhemp.co"

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim()
const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim()

export const SUPPORT_EMAIL = supportEmail || defaultSupportEmail
export const SUPPORT_PHONE = supportPhone || null
