import Link from "next/link";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions";
import { readActiveBusinessCookie } from "@/features/businesses/active-business";
import { BusinessSwitcher } from "@/features/businesses/components/business-switcher";
import { listMyBusinesses } from "@/features/businesses/queries";
import { resolveActiveBusinessId } from "@/features/businesses/resolve-active-business";
import { requireUser } from "@/lib/auth/current-user";

/**
 * Every route in this group depends on the request's session, so none of them
 * can be prerendered at build time.
 *
 * Without this, Next.js tries to statically export /dashboard and /onboarding.
 * It usually gets away with it locally by accident: createClient() reads
 * cookies(), and that read is what marks the route dynamic. But the Supabase
 * environment check runs *before* the cookies() call, so on a machine without
 * those variables -- CI, which has no .env.local -- it throws first, the
 * dynamic signal is never emitted, and the build fails while prerendering a
 * page that was never meant to be static.
 *
 * Declaring it here states the intent instead of relying on that ordering,
 * which would otherwise break again the moment the two lines were swapped.
 */
export const dynamic = "force-dynamic";

/**
 * Application shell for signed-in people.
 *
 * `requireUser()` runs here rather than relying on the Proxy alone. The Proxy
 * redirects unauthenticated traffic too, but it is matched by path and a
 * matcher change would silently remove that cover.
 *
 * This layout does not redirect to onboarding: /onboarding renders inside it,
 * so a redirect here would loop. The pages beneath decide that.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireUser();

  const businesses = await listMyBusinesses();
  const activeBusinessId = resolveActiveBusinessId(
    await readActiveBusinessCookie(),
    businesses,
  );

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/dashboard"
            className="text-sm font-semibold tracking-tight whitespace-nowrap"
          >
            NegosyoOS PH
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground whitespace-nowrap">
              Prototype
            </span>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
        <div className="mx-auto w-full max-w-3xl px-4 pb-3 sm:px-6">
          <div className="rounded-md border border-dashed px-3 py-2">
            <BusinessSwitcher
              businesses={businesses}
              activeBusinessId={activeBusinessId}
            />
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
