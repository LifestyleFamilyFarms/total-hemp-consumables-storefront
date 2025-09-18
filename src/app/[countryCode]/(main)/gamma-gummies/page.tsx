import type { Metadata } from "next"

import GammaHero from "@modules/gamma-gummies/hero"
import FlavorShowcase from "@modules/gamma-gummies/flavor-showcase"
import LabPanel from "@modules/gamma-gummies/lab-panel"
import GammaSignupCard from "@modules/gamma-gummies/signup-card"

export const metadata: Metadata = {
  title: "Gamma Gummies Launch | Total Hemp Consumables",
  description:
    "Join the Gamma Gummies launch list to receive allocation details, lab reports, and exclusive events.",
}

export default function GammaGummiesPage({
  params,
}: {
  params: { countryCode: string }
}) {
  const { countryCode } = params

  return (
    <main className="space-y-16 pb-16">
      <GammaHero countryCode={countryCode} signupAnchor="#gamma-signup" />
      <FlavorShowcase />
      <LabPanel />
      <GammaSignupCard id="gamma-signup" />
    </main>
  )
}
