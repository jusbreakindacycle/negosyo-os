import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function PublicHomePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-12 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Prototype
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          NegosyoOS PH
        </h1>
        <p className="text-base text-muted-foreground text-pretty">
          One place to keep track of what your business needs to register and
          renew, and what is actually moving in and out day to day.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-sm font-semibold">Start &amp; Comply</h2>
          <p className="text-sm text-muted-foreground text-pretty">
            Keep your registrations, permits, requirements, fees, documents, and
            due dates organised in one place — including who is handling what.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-sm font-semibold">Operate &amp; Decide</h2>
          <p className="text-sm text-muted-foreground text-pretty">
            Record what you have, what you bought, and what you spent, so you
            can see shortages and differences early and decide what to do.
          </p>
        </div>
      </section>

      <div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/dashboard">Open the prototype</Link>
        </Button>
      </div>

      <footer className="mt-auto border-t pt-6">
        <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
          NegosyoOS PH is a working name and this is an early prototype under
          testing. It is not a government service and it does not file anything
          on your behalf. It does not provide legal, accounting, or tax advice,
          and it cannot confirm that a business is fully compliant.
        </p>
      </footer>
    </main>
  );
}
