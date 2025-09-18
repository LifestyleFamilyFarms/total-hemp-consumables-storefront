import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme/theme-provider"
import "./global.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="base">
      <body>
        <ThemeProvider>
          <main className="relative">{props.children}</main>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

