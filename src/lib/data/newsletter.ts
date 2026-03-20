"use server"

import { z } from "zod"

const emailSchema = z.string().email("Please enter a valid email address")

export type NewsletterResult = {
  success: boolean
  message: string
}

export async function subscribeToNewsletter(
  email: string
): Promise<NewsletterResult> {
  const parsed = emailSchema.safeParse(email)
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0].message }
  }

  // TODO: Connect to SendGrid when newsletter strategy is defined.
  // For now, log the subscription and return success.
  console.log("[Newsletter] Subscription request:", parsed.data)

  return { success: true, message: "You're in!" }
}
