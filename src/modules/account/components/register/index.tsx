"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div
      className="mx-auto flex w-full max-w-[34rem] flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-ui-fg-base">
        Join us!
      </h1>
      <p className="mb-4 text-center text-sm leading-5 text-foreground/90 small:mb-5">
        Join now to earn loyalty points toward future discounts, track your
        orders, and speed through checkout.
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="grid w-full gap-2 small:grid-cols-2">
          <div>
            <Input
              label="First name"
              name="first_name"
              required
              autoComplete="given-name"
              data-testid="first-name-input"
            />
          </div>
          <div>
            <Input
              label="Last name"
              name="last_name"
              required
              autoComplete="family-name"
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
              data-testid="email-input"
            />
          </div>
          <div>
            <Input
              label="Phone"
              name="phone"
              type="tel"
              autoComplete="tel"
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
              data-testid="password-input"
            />
          </div>
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="mt-4 text-center text-xs leading-5 text-foreground/90">
          By creating an account, you agree to Total Hemp Consumables&apos;{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline underline-offset-4"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline underline-offset-4"
          >
            Terms of Use
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-4" data-testid="register-button">
          Sign Up
        </SubmitButton>
      </form>
      <span className="mt-4 text-center text-small-regular text-foreground/95">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="font-medium text-ui-fg-interactive underline underline-offset-4 hover:text-ui-fg-interactive-hover"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register
