import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"
import { cn } from "src/lib/utils"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="w-full border-t border-border/60 bg-background/70">
      <div className="content-container flex w-full flex-col gap-10 py-16">
        <div className="grid grid-cols-1 gap-10 rounded-3xl border border-border/70 bg-card/70 p-8 shadow-[0_28px_60px_rgba(6,10,22,0.32)] backdrop-blur sm:grid-cols-[1.1fr_auto]">
          <div className="flex flex-col gap-4">
            <LocalizedClientLink
              href="/"
              className="inline-flex w-fit items-center gap-3 rounded-full border border-border/70 bg-card/80 px-5 py-2 text-lg font-semibold uppercase tracking-[0.25em] text-foreground shadow-[0_16px_40px_rgba(6,10,22,0.28)] transition hover:-translate-y-[1px]"
            >
              Total Hemp
            </LocalizedClientLink>
            <p className="max-w-xl text-sm leading-relaxed text-foreground/70">
              Premium consumables, verified compliance, and ShipStation-backed delivery. Built with Medusa and Next.js for a fast, stable checkout.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm text-muted-foreground sm:grid-cols-3">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/70">
                  Categories
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li
                        className="flex flex-col gap-2"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={cn(
                            "text-foreground/80 transition hover:text-foreground",
                            children && "font-semibold"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 gap-2 pl-2">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="text-foreground/70 transition hover:text-foreground"
                                    href={`/categories/${child.handle}`}
                                    data-testid="category-link"
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/70">
                  Collections
                </span>
                <ul
                  className={cn(
                    "grid grid-cols-1 gap-2",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="text-foreground/80 transition hover:text-foreground"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/70">
                Medusa
              </span>
              <ul className="grid grid-cols-1 gap-2">
                <li>
                  <a
                    href="https://github.com/medusajs"
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground/80 transition hover:text-foreground"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.medusajs.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground/80 transition hover:text-foreground"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/medusajs/nextjs-starter-medusa"
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground/80 transition hover:text-foreground"
                  >
                    Source code
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground/80">
            © {new Date().getFullYear()} Total Hemp. All rights reserved.
          </span>
          <MedusaCTA />
        </div>
      </div>
    </footer>
  )
}
