import { VariantPrice } from "types/global"
import { cn } from "src/lib/utils"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <>
      {price.price_type === "sale" && (
        <span
          className="line-through text-muted-foreground"
          data-testid="original-price"
        >
          {price.original_price}
        </span>
      )}
      <span
        className={cn("text-foreground font-semibold", {
          "text-primary": price.price_type === "sale",
        })}
        data-testid="price"
      >
        {price.calculated_price}
      </span>
    </>
  )
}
