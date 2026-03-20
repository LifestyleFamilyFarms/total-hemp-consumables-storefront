"use client"

import { useActionState, useState, useEffect, useRef } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { RegisterSchema, validateFormData } from "@lib/validation/auth-schemas"
import PasswordStrengthBar from "@modules/account/components/password-strength-bar"
import { toast } from "@/components/ui/sonner"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null)
  const [password, setPassword] = useState("")
  const hasSubmitted = useRef(false)

  // Show success toast when signup completes (message stays null = success)
  useEffect(() => {
    if (hasSubmitted.current && message === null) {
      toast.success("Account created! Welcome to Total Hemp.")
      hasSubmitted.current = false
    }
  }, [message])

  const handleSubmit = (formData: FormData) => {
    const { errors } = validateFormData(RegisterSchema, formData)
    if (errors) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors(null)
    hasSubmitted.current = true
    formAction(formData)
  }

  return (
    <div
      className="mx-auto flex w-full max-w-[34rem] flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-foreground">
        Create your account
      </h1>
      <p className="mb-4 text-center text-sm leading-5 text-foreground/80 small:mb-5">
        Earn loyalty points, track your orders, and check out faster.
      </p>
      <form className="w-full flex flex-col" action={handleSubmit}>
        <div className="grid w-full gap-3 small:grid-cols-2">
          <div>
            <Input
              label="First name"
              name="first_name"
              required
              autoComplete="given-name"
              error={fieldErrors?.first_name}
              data-testid="first-name-input"
            />
          </div>
          <div>
            <Input
              label="Last name"
              name="last_name"
              required
              autoComplete="family-name"
              error={fieldErrors?.last_name}
              data-testid="last-name-input"
            />
          </div>
          <div>
            <Input
              label="Email"
              name="email"
              required
              type="email"
              autoComplete="email"
              error={fieldErrors?.email}
              data-testid="email-input"
            />
          </div>
          <div>
            <Input
              label="Phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              error={fieldErrors?.phone}
              data-testid="phone-input"
            />
          </div>
          <div className="small:col-span-2">
            <Input
              label="Password"
              name="password"
              required
              type="password"
              autoComplete="new-password"
              error={fieldErrors?.password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="password-input"
            />
            <PasswordStrengthBar password={password} className="mt-2" />
          </div>

          {/* Age verification checkbox — hemp compliance requires 21+ */}
          <div className="small:col-span-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="age_confirmed"
                required
                className="mt-0.5 h-5 w-5 rounded border-input accent-[hsl(var(--brand-teal))] focus:ring-2 focus:ring-ring"
                data-testid="age-confirm-checkbox"
              />
              <span className="text-xs leading-5 text-foreground/80 group-hover:text-foreground transition-colors">
                I confirm that I am <strong>21 years of age or older</strong>.
                Hemp products are restricted to adults only.
              </span>
            </label>
            {fieldErrors?.age_confirmed && (
              <p className="mt-1 text-xs font-medium text-destructive" role="alert">
                {fieldErrors.age_confirmed}
              </p>
            )}
          </div>
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="mt-4 text-center text-xs leading-5 text-foreground/70">
          By creating an account, you agree to Total Hemp
          Consumables&apos;{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Terms of Use
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-4" data-testid="register-button">
          Create Account
        </SubmitButton>
      </form>
      <span className="mt-4 text-center text-sm text-foreground/80">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="font-semibold text-[hsl(var(--brand-teal))] underline underline-offset-4 hover:text-[hsl(var(--brand-teal))]/80 transition-colors"
        >
          Sign in
        </button>
      </span>
    </div>
  )
}

export default Register
