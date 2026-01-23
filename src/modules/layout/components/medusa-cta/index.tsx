import Medusa from "../../../common/icons/medusa"
import NextJs from "../../../common/icons/nextjs"

const MedusaCTA = () => {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-foreground/70 shadow-[0_10px_24px_rgba(6,10,22,0.2)]">
      <span>Powered by</span>
      <a
        className="inline-flex items-center gap-1 text-foreground hover:text-primary"
        href="https://www.medusajs.com"
        target="_blank"
        rel="noreferrer"
      >
        <Medusa color="currentColor" />
      </a>
      <span className="text-foreground/40">•</span>
      <a
        className="inline-flex items-center gap-1 text-foreground hover:text-primary"
        href="https://nextjs.org"
        target="_blank"
        rel="noreferrer"
      >
        <NextJs color="currentColor" />
      </a>
    </span>
  )
}

export default MedusaCTA
