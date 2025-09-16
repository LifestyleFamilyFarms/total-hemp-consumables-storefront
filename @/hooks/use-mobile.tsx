import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const computeIsMobile = () => {
      const minDimension = Math.min(window.innerWidth, window.innerHeight)
      setIsMobile(minDimension < MOBILE_BREAKPOINT)
    }

    computeIsMobile()

    window.addEventListener("resize", computeIsMobile)
    window.addEventListener("orientationchange", computeIsMobile)

    return () => {
      window.removeEventListener("resize", computeIsMobile)
      window.removeEventListener("orientationchange", computeIsMobile)
    }
  }, [])

  return !!isMobile
}
