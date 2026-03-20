"use client"

import { LOGIN_VIEW } from "@modules/account/templates/login-template"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ForgotPassword = ({ setCurrentView }: Props) => {
  return (
    <div className="mx-auto flex w-full max-w-[30rem] flex-col items-center">
      <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-foreground">
        Reset your password
      </h1>
      <p className="text-center text-sm text-foreground/80">
        Coming soon — this will be replaced in the next task.
      </p>
    </div>
  )
}

export default ForgotPassword
