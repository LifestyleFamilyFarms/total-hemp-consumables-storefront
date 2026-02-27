type StaticContentPageProps = {
  title: string
  intro: string
  lastUpdated?: string
  children: React.ReactNode
}

export default function StaticContentPage({
  title,
  intro,
  lastUpdated,
  children,
}: StaticContentPageProps) {
  return (
    <main className="py-10 sm:py-14">
      <div className="content-container max-w-4xl">
        <article className="rounded-2xl border border-border/70 bg-background/80 p-6 shadow-sm sm:p-8">
          <header className="space-y-3 border-b border-border/60 pb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              {intro}
            </p>
            {lastUpdated ? (
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground/90">
                Last updated: {lastUpdated}
              </p>
            ) : null}
          </header>
          <div className="mt-6 space-y-6 text-sm leading-7 text-foreground/85 sm:text-base">
            {children}
          </div>
        </article>
      </div>
    </main>
  )
}
