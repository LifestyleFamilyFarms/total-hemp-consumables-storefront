import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="flex w-full flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="mb-3 text-center text-2xl font-semibold tracking-tight text-ui-fg-base">
        Welcome back
      </h1>
      <p className="mb-6 text-center text-sm leading-6 text-ui-fg-subtle small:mb-8">
        Sign in to track orders, redeem loyalty points, and check out faster.
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          Sign in
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        New here?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="font-medium text-ui-fg-interactive underline underline-offset-4 hover:text-ui-fg-interactive-hover"
          data-testid="register-button"
        >
          Sign up
        </button>
        .
      </span>
    </div>
  )
}

export default Login
