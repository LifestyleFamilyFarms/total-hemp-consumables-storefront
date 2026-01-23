import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Beverages",
  description: "Explore our beverages collection.",
}

export default function BeveragesPage() {
  return (
    <div className="py-12">
      <div className="content-container">
        <h1 className="text-3xl font-semibold text-foreground">Beverages</h1>
        <p className="text-muted-foreground mt-2">
          This category page is coming soon.
        </p>
      </div>
    </div>
  )
}
