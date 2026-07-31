import Link from "next/link";

/**
 * Application shell.
 *
 * Static for this milestone: there is no authentication, no session, and no
 * data. The business name is a visible placeholder rather than a fetched
 * value, so nothing here implies a signed-in user or a real record.
 */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight whitespace-nowrap"
          >
            NegosyoOS PH
          </Link>
          <span className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground whitespace-nowrap">
            Prototype
          </span>
        </div>
        <div className="mx-auto w-full max-w-3xl px-4 pb-3 sm:px-6">
          <div className="rounded-md border border-dashed px-3 py-2">
            <p className="text-xs text-muted-foreground">
              Business:{" "}
              <span className="font-medium text-foreground">
                No business selected yet
              </span>
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
          <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
            Prototype only. Not a government service, and not legal, accounting,
            or tax advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
