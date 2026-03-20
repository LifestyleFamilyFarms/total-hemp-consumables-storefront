"use client"

import { useActionState, useState } from "react"
import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { LoginSchema, validateFormData } from "@lib/validation/auth-schemas"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null)

  const handleSubmit = (formData: FormData) => {
    const { errors } = validateFormData(LoginSchema, formData)
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
      data-testid="login-page"
    >
      <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-foreground">
        Sign in to Total Hemp
      </h1>
      <p className="mb-6 text-center text-sm leading-6 text-foreground/80 small:mb-8">
        Track orders, earn loyalty rewards, and check out faster.
      </p>
      <form className="w-full" action={handleSubmit}>
        <div className="flex w-full flex-col gap-y-3">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            error={fieldErrors?.email}
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            error={fieldErrors?.password}
            data-testid="password-input"
          />
        </div>
        {/* Forgot password link */}
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD)}
            className="text-xs font-medium text-foreground/70 underline underline-offset-4 hover:text-foreground transition-colors"
            data-testid="forgot-password-link"
          >
            Forgot password?
          </button>
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-5">
          Sign in
        </SubmitButton>
      </form>
      <span className="mt-6 text-center text-sm text-foreground/80">
        New to Total Hemp?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="font-semibold text-[hsl(var(--brand-teal))] underline underline-offset-4 hover:text-[hsl(var(--brand-teal))]/80 transition-colors"
          data-testid="register-button"
        >
          Create an account
        </button>
      </span>
    </div>
  )
}

export default Login
