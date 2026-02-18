"use server"

import {
  DEFAULT_SIGNUP_SOURCE,
  processSignupPayload,
  SignupError,
} from "./signup-core"

export type SignupActionState = {
  success: boolean
  message: string
} | null

export async function submitGammaSignup(
  _currentState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const payload = {
    email: String(formData.get("email") ?? ""),
    first_name: String(formData.get("first_name") ?? ""),
    last_name: String(formData.get("last_name") ?? ""),
    signup_source: String(formData.get("signup_source") ?? DEFAULT_SIGNUP_SOURCE),
    campaign: "gamma_gummies_event_2025" as const,
    hp: String(formData.get("hp") ?? ""),
  }

  try {
    const { message } = await processSignupPayload(payload)
    return { success: true, message }
  } catch (error) {
    if (error instanceof SignupError) {
      return { success: false, message: error.message }
    }

    return {
      success: false,
      message: "Unable to submit right now. Please try again.",
    }
  }
}
