import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { readActiveBusinessCookie } from "@/features/businesses/active-business";
import { listMyBusinesses } from "@/features/businesses/queries";
import { resolveActiveBusiness } from "@/features/businesses/resolve-active-business";
import { requireUser } from "@/lib/auth/current-user";

/**
 * Shell landing page.
 *
 * Shows the active business by name. The two domain workspaces are still
 * placeholders — they arrive in Milestone 2.
 */
export default async function DashboardPage() {
  await requireUser();

  const businesses = await listMyBusinesses();

  // Handled here rather than in the layout, which also wraps /onboarding.
  if (businesses.length === 0) {
    redirect("/onboarding");
  }

  const activeBusiness = resolveActiveBusiness(
    await readActiveBusinessCookie(),
    businesses,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-pretty">
          {activeBusiness?.name ?? "Your business"}
        </h1>
        <p className="text-sm text-muted-foreground text-pretty">
          One workspace handles what the government needs from your business.
          The other handles what happens inside it every day.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Start &amp; Comply</CardTitle>
            <CardDescription className="text-pretty">
              Registrations, permits, requirements, fees, documents, and due
              dates — and who is handling each one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Not set up yet. This workspace will keep each requirement, the
              document that proves it, and the date it expires, without
              guessing at anything that has not been confirmed.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Operate &amp; Decide</CardTitle>
            <CardDescription className="text-pretty">
              Stock and supplies, purchases, money going out, and differences
              worth checking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Not set up yet. This workspace will compare what you expected
              against what you actually counted, so a shortage shows up while
              you can still do something about it.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
