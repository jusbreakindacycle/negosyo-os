import Link from "next/link";

/**
 * Shell for sign-in and sign-up.
 *
 * Deliberately narrow and centred: these are the only two screens someone sees
 * before they have an account, and they are most often opened on a phone.
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-5 py-3 sm:px-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            NegosyoOS PH
          </Link>
          <span className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
            Prototype
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10 sm:px-6">
        {children}
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-md px-5 py-4 sm:px-6">
          <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
            Prototype only. Not a government service, and not legal, accounting,
            or tax advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
