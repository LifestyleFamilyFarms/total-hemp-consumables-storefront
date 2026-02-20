import { BrandSpinner } from "@/components/brand/brand-spinner"

export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-full text-ui-fg-base">
      <BrandSpinner className="h-9 w-9" />
    </div>
  )
}
