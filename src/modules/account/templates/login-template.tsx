"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { BrandLogo } from "@/components/brand/brand-logo"
import { useTheme } from "@/components/theme/theme-provider"
import {
  BrandThemeId,
  getAuthPanelLogoVariantForTheme,
} from "@lib/brand"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const resolveLoginView = (viewParam: string | null): LOGIN_VIEW => {
  if (!viewParam) {
    return LOGIN_VIEW.SIGN_IN
  }

  const normalized = viewParam.toLowerCase()

  if (normalized === "register" || normalized === "signup" || normalized === "sign-up") {
    return LOGIN_VIEW.REGISTER
  }

  return LOGIN_VIEW.SIGN_IN
}

const LoginTemplate = () => {
  const searchParams = useSearchParams()
  const requestedView = useMemo(
    () => resolveLoginView(searchParams.get("view")),
    [searchParams]
  )
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(requestedView)
  const { theme } = useTheme()
  const currentTheme = theme as BrandThemeId
  const authLogoVariant = getAuthPanelLogoVariantForTheme(currentTheme)
  const isRegisterView = currentView === LOGIN_VIEW.REGISTER

  useEffect(() => {
    setCurrentView(requestedView)
  }, [requestedView])

  return (
    <div
      className={`flex min-h-[calc(100dvh-6.25rem)] w-full justify-center px-3 py-2 small:px-6 small:py-4 ${isRegisterView ? "items-start" : "items-center"}`}
      data-auth-isolated="true"
    >
      <section className="surface-universal relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden min-h-[560px] overflow-hidden border-r border-ui-border-base/45 lg:block">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
            <div className="absolute -bottom-12 -right-10 h-64 w-64 rounded-full bg-secondary/25 blur-3xl" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="relative w-full max-w-[540px]">
              <BrandLogo
                variant={authLogoVariant}
                size="md"
                format="svg"
                priority
                className="w-full opacity-95 drop-shadow-[0_20px_40px_hsl(var(--surface-glass-shadow)/0.24)]"
              />
              <div className="auth-logo-overlay pointer-events-none absolute left-1/2 top-1/2 w-[82%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border" />
            </div>
          </div>
        </div>
        <div className={`relative mx-auto flex w-full flex-col items-center lg:min-h-[560px] lg:max-w-none ${isRegisterView ? "max-w-xl p-3 small:p-5 md:p-6" : "max-w-md p-5 small:p-8 md:p-10"}`}>
          <div className="mb-3 flex w-full justify-center lg:hidden">
            <BrandLogo
              theme={currentTheme}
              slot="hero"
              size="md"
              format="svg"
              priority
              className="w-full max-w-[320px] opacity-95"
            />
          </div>
          <div className={`surface-universal mx-auto w-full rounded-3xl text-foreground ${isRegisterView ? "p-4 small:p-5 md:p-6" : "p-5 small:p-8"}`}>
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
