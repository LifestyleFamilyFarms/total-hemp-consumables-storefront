import "./global.css"
import { Analytics } from "@vercel/analytics/next"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Providers } from "../providers"
import { Toaster } from "@/components/ui/sonner"
import { DEFAULT_THEME_ID } from "@/themes/config"
import ShellParallaxBackground from "@/components/layout/shell-parallax-background"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Total Hemp Consumables",
    template: "%s | Total Hemp Consumables",
  },
  description:
    "Shop compliant hemp-derived products with transparent sourcing, tested ingredients, and customer-first support.",
  openGraph: {
    type: "website",
    siteName: "Total Hemp Consumables",
    title: "Total Hemp Consumables",
    description:
      "Shop compliant hemp-derived products with transparent sourcing, tested ingredients, and customer-first support.",
    images: [
      {
        url: "/opengraph-image.jpg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Total Hemp Consumables",
    description:
      "Shop compliant hemp-derived products with transparent sourcing, tested ingredients, and customer-first support.",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const isProd = process.env.NODE_ENV === "production"
  // const Analytics = isProd
  //   ? // eslint-disable-next-line @typescript-eslint/no-var-requires
  //     require("@vercel/analytics/next").Analytics
  //   : null

  return (
    <html lang="en" data-theme={DEFAULT_THEME_ID}>
      <head>
        {/* Clarendon Adobe Font*/}
        <link rel="stylesheet" href="https://use.typekit.net/kwa1csc.css" />
      </head>
      <body className="app-shell-bg">
        <div className="relative">
          <ShellParallaxBackground />
          <Providers>
            <main className="relative">{props.children}</main>
            <Toaster />
            {isProd ? <Analytics /> : null}
          </Providers>
        </div>
      </body>
    </html>
  )
}
