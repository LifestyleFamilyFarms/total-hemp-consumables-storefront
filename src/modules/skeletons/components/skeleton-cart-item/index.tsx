import { TableCell, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

const SkeletonCartItem = () => {
  return (
    <TableRow className="w-full m-4">
      <TableCell className="!pl-0 p-4 w-24">
        <Skeleton className="h-24 w-24 rounded-xl" />
      </TableCell>
      <TableCell className="text-left">
        <div className="flex flex-col gap-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2 items-center">
          <Skeleton className="h-8 w-6" />
          <Skeleton className="h-10 w-14" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-12" />
        </div>
      </TableCell>
      <TableCell className="!pr-0 text-right">
        <div className="flex gap-2 justify-end">
          <Skeleton className="h-6 w-12" />
        </div>
      </TableCell>
    </TableRow>
  )
}

export default SkeletonCartItem
