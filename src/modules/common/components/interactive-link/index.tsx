import { ArrowUpRight } from "lucide-react"
import LocalizedClientLink from "../localized-client-link"

type InteractiveLinkProps = {
  href: string
  children?: React.ReactNode
  onClick?: () => void
}

const InteractiveLink = ({
  href,
  children,
  onClick,
  ...props
}: InteractiveLinkProps) => {
  return (
    <LocalizedClientLink
      className="flex gap-x-1 items-center group"
      href={href}
      onClick={onClick}
      {...props}
    >
      <span className="text-ui-fg-interactive text-sm font-medium">
        {children}
      </span>
      <ArrowUpRight className="h-4 w-4 transition-transform duration-150 group-hover:rotate-45" />
    </LocalizedClientLink>
  )
}

export default InteractiveLink
