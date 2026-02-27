"use client"

import { useState } from "react"
import { BrandLogo } from "@/components/brand/brand-logo"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(LOGIN_VIEW.SIGN_IN)

  return (
    <div
      className="w-full px-3 py-4 small:px-6 small:py-8"
      data-auth-isolated="true"
    >
      <section className="surface-panel relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-ui-border-base/60 shadow-[0_22px_56px_hsl(var(--surface-glass-shadow)/0.22)] md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden min-h-[560px] overflow-hidden border-r border-ui-border-base/45 md:block">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
            <div className="absolute -bottom-12 -right-10 h-64 w-64 rounded-full bg-secondary/25 blur-3xl" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center px-8">
            <BrandLogo
              variant="roundFullColorLogo"
              size="md"
              format="svg"
              priority
              className="w-full max-w-[360px] opacity-90 drop-shadow-[0_16px_34px_hsl(var(--surface-glass-shadow)/0.22)]"
            />
          </div>
          <div className="absolute bottom-10 left-10 right-10 rounded-2xl border border-ui-border-base/45 bg-[hsl(var(--card)/0.5)] p-4 backdrop-blur-md">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-ui-fg-subtle">
              Total Hemp Consumables
            </h2>
            <p className="mt-2 text-sm leading-6 text-ui-fg-base">
              Members earn loyalty points toward future discounts and get a
              faster repeat checkout flow.
            </p>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md p-5 small:p-8 md:max-w-none md:p-10">
          <div className="rounded-3xl border border-ui-border-base/70 bg-[hsl(var(--card)/0.72)] p-5 backdrop-blur-xl small:p-8">
            {currentView === LOGIN_VIEW.SIGN_IN ? (
              <Login setCurrentView={setCurrentView} />
            ) : (
              <Register setCurrentView={setCurrentView} />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default LoginTemplate
