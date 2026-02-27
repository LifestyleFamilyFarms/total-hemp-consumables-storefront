import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="flex flex-col items-start justify-center px-2 py-20 small:py-28 large:py-36"
      data-testid="empty-cart-message"
    >
      <h1 className="flex flex-row text-3xl-regular gap-x-2 items-baseline">
        Cart
      </h1>
      <p className="text-base-regular mt-4 mb-6 max-w-[32rem]">
        You don&apos;t have anything in your cart. Let&apos;s change that, use
        the link below to start browsing our products.
      </p>
      <div>
        <InteractiveLink href="/store">Explore products</InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
