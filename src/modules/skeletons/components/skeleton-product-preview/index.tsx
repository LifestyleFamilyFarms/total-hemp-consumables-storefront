import { Skeleton } from "@/components/ui/skeleton"

const SkeletonProductPreview = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[9/16] w-full rounded-2xl" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-5 w-1/5" />
      </div>
    </div>
  )
}

export default SkeletonProductPreview
