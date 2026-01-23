import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table"

import repeat from "@lib/util/repeat"
import SkeletonCartItem from "@modules/skeletons/components/skeleton-cart-item"
import SkeletonCodeForm from "@modules/skeletons/components/skeleton-code-form"
import SkeletonOrderSummary from "@modules/skeletons/components/skeleton-order-summary"
import { Skeleton } from "@/components/ui/skeleton"

const SkeletonCartPage = () => {
  return (
    <div className="py-12">
      <div className="content-container">
        <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-40">
          <div className="flex flex-col bg-white p-6 gap-y-6">
            <div className="bg-white flex items-start justify-between">
              <div className="flex flex-col gap-y-2">
                <Skeleton className="h-8 w-60" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div>
                <Skeleton className="h-8 w-14" />
              </div>
            </div>
            <div>
              <div className="pb-3 flex items-center">
                <Skeleton className="h-12 w-20" />
              </div>
              <Table>
                <TableHeader className="border-t-0">
                  <TableRow>
                    <TableHead className="!pl-0">
                      <Skeleton className="h-6 w-10" />
                    </TableHead>
                    <TableHead></TableHead>
                    <TableHead>
                      <Skeleton className="h-6 w-16" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-6 w-12" />
                    </TableHead>
                    <TableHead className="!pr-0">
                      <div className="flex justify-end">
                        <Skeleton className="h-6 w-12" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repeat(4).map((index) => (
                    <SkeletonCartItem key={index} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex flex-col gap-y-8">
            <SkeletonOrderSummary />
            <SkeletonCodeForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonCartPage
