"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { BrandLogo } from "@/components/brand/brand-logo"
import { useTheme } from "@/components/theme/theme-provider"
import {
  BrandThemeId,
  getAuthPanelLogoVariantForTheme,
} from "@lib/brand"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import ForgotPassword from "@modules/account/components/forgot-password"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  FORGOT_PASSWORD = "forgot-password",
}

const resolveLoginView = (viewParam: string | null): LOGIN_VIEW => {
  if (!viewParam) {
    return LOGIN_VIEW.SIGN_IN
  }

  const normalized = viewParam.toLowerCase()

  if (normalized === "register" || normalized === "signup" || normalized === "sign-up") {
    return LOGIN_VIEW.REGISTER
  }

  if (normalized === "forgot-password" || normalized === "reset") {
    return LOGIN_VIEW.FORGOT_PASSWORD
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

  const [isTransitioning, setIsTransitioning] = useState(false)

  // Smooth view transition handler with cleanup for rapid switching
  const transitionTimer = useRef<number | undefined>(undefined)

  const handleViewChange = useCallback((view: LOGIN_VIEW) => {
    clearTimeout(transitionTimer.current)
    setIsTransitioning(true)
    transitionTimer.current = window.setTimeout(() => {
      setCurrentView(view)
      setIsTransitioning(false)
    }, 150)
  }, [])

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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-8">
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
            {/* Tagline */}
            <p className="max-w-xs text-center text-sm font-medium leading-relaxed text-foreground/60">
              Premium hemp &amp; CBD products — lab-tested, legally compliant, delivered to your door.
            </p>
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
              className="w-full max-w-[280px] opacity-95"
            />
          </div>
          <div
            className={`surface-universal mx-auto w-full rounded-3xl text-foreground transition-opacity duration-150 ease-in-out ${
              isTransitioning ? "opacity-0" : "opacity-100"
            } ${isRegisterView ? "p-4 small:p-5 md:p-6" : "p-5 small:p-8"}`}
          >
            {currentView === LOGIN_VIEW.SIGN_IN && (
              <Login setCurrentView={handleViewChange} />
            )}
            {currentView === LOGIN_VIEW.REGISTER && (
              <Register setCurrentView={handleViewChange} />
            )}
            {currentView === LOGIN_VIEW.FORGOT_PASSWORD && (
              <ForgotPassword setCurrentView={handleViewChange} />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default LoginTemplate
