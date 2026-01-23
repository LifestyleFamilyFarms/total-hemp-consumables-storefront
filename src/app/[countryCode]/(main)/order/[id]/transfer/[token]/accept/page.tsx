import { acceptTransferRequest } from "@lib/data/orders"
import TransferImage from "@modules/order/components/transfer-image"

export default async function TransferPage({
  params,
}: {
  params: Promise<{ id: string; token: string }>
}) {
  const { id, token } = await params

  const { success, error } = await acceptTransferRequest(id, token)

  return (
    <div className="flex flex-col gap-y-4 items-start w-2/5 mx-auto mt-10 mb-20">
      <TransferImage />
      <div className="flex flex-col gap-y-6">
        {success && (
          <>
            <h1 className="text-xl text-zinc-900">
              Order transfered!
            </h1>
            <p className="text-zinc-600">
              Order {id} has been successfully transfered to the new owner.
            </p>
          </>
        )}
        {!success && (
          <>
            <p className="text-zinc-600">
              There was an error accepting the transfer. Please try again.
            </p>
            {error && (
              <p className="text-red-500">Error message: {error}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
