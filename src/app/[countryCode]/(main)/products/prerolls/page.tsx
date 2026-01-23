import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Prerolls",
  description: "Explore our prerolls collection.",
}

export default function PrerollsPage() {
  return (
    <div className="py-12">
      <div className="content-container">
        <h1 className="text-3xl font-semibold text-foreground">Prerolls</h1>
        <p className="text-muted-foreground mt-2">
          This category page is coming soon.
        </p>
      </div>
    </div>
  )
}
