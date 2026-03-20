"use client"

import { useActionState, useState } from "react"
import { requestPasswordReset } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { ForgotPasswordSchema, validateFormData } from "@lib/validation/auth-schemas"
import { ArrowLeft, Mail } from "lucide-react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [state, formAction] = useActionState(requestPasswordReset, {
    success: false,
    error: null,
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null)

  const handleSubmit = (formData: FormData) => {
    const { errors } = validateFormData(ForgotPasswordSchema, formData)
    if (errors) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors(null)
    formAction(formData)
  }

  return (
    <div
      className="mx-auto flex w-full max-w-[30rem] flex-col items-center"
      data-testid="forgot-password-page"
    >
      {state.success && !fieldErrors ? (
        /* ── Success state ── */
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--brand-teal))]/15">
            <Mail className="h-7 w-7 text-[hsl(var(--brand-teal))]" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="mb-6 text-sm leading-6 text-foreground/80">
            If an account exists with that email, we&apos;ve sent password reset
            instructions. Check your inbox and spam folder.
          </p>
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--brand-teal))] hover:text-[hsl(var(--brand-teal))]/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </button>
        </div>
      ) : (
        /* ── Form state ── */
        <>
          <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-foreground">
            Reset your password
          </h1>
          <p className="mb-6 text-center text-sm leading-6 text-foreground/80">
            Enter the email associated with your account and we&apos;ll send
            you a link to reset your password.
          </p>
          <form className="w-full" action={handleSubmit}>
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              error={fieldErrors?.email}
              data-testid="forgot-email-input"
            />
            <SubmitButton className="w-full mt-6" data-testid="forgot-submit">
              Send reset link
            </SubmitButton>
          </form>
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="mt-6 inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </button>
        </>
      )}
    </div>
  )
}

export default ForgotPassword
