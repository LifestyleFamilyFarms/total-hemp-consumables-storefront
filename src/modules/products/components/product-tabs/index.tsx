"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Composition & Terpenes",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Shipping & Compliance",
      component: <ShippingInfoTab product={product} />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const metadata = product?.metadata || {}
  return (
    <div className="space-y-4 py-6 text-sm text-foreground/70">
      <p>
        {(metadata?.formulation as string) ||
          "Gamma Gummies use nano-emulsified hemp extract, organic cane sugar, fruit reductions, and functional botanicals."}
      </p>
      <div className="grid gap-4 rounded-2xl border border-border/60 bg-background/70 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <Row label="Cannabinoids" value={(metadata?.cannabinoids as string) || "CBG • CBD • Δ8 • trace minors"} />
        <Row label="Terpene ratio" value={(metadata?.terpenes as string) || "Limonene-forward with myrcene support"} />
        <Row label="Dosage" value={(metadata?.dosage as string) || "5 mg nano-emulsified cannabinoids per gummy"} />
        <Row label="Ingredients" value={(metadata?.ingredients as string) || "Organic cane sugar, fruit puree, pectin, hemp extract, adaptogenic blend."} />
      </div>
    </div>
  )
}

const ShippingInfoTab = ({ product }: ProductTabsProps) => {
  const metadata = product?.metadata || {}
  return (
    <div className="space-y-4 py-6 text-sm text-foreground/70">
      <p>
        {(metadata?.shipping_note as string) ||
          "Ships to all compliant states with 21+ signature required. Orders placed before 2 PM ship same day Monday–Thursday."}
      </p>
      <div className="grid gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 text-[12px] uppercase tracking-[0.3em] text-foreground/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <span>21+ required at delivery</span>
        <span>FedEx compliant carrier</span>
        <span>Farm Bill 2018 aligned</span>
        <span>QR-linked COAs in every package</span>
      </div>
    </div>
  )
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-3 text-xs sm:text-sm">
    <span className="uppercase tracking-[0.3em] text-foreground/60">{label}</span>
    <span className="text-right text-foreground/80">{value}</span>
  </div>
)

export default ProductTabs
