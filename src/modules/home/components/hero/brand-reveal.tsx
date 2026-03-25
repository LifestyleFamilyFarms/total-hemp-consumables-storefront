"use client"

import { BrandLogo } from "@/components/brand/brand-logo"
import { useTheme } from "@/components/theme/theme-provider"
import { getAuthPanelLogoVariantForTheme, BrandThemeId } from "@lib/brand"

export default function BrandReveal() {
  const { theme } = useTheme()
  const logoVariant = getAuthPanelLogoVariantForTheme(theme as BrandThemeId)

  return (
    <div
      className="relative z-10 flex justify-center -mt-4"
      style={{
        animation:
          "hero-blur-reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both",
      }}
    >
      <div className="h-40 w-40 small:h-52 small:w-52">
        <BrandLogo
          variant={logoVariant}
          format="svg"
          size="md"
          priority
          className="h-full w-full opacity-95 drop-shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
        />
      </div>
    </div>
  )
}
