import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Shell landing page.
 *
 * Presents the two bounded domains side by side. Nothing here is wired to data
 * yet — the domain workspaces arrive in later build-plan milestones.
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Your two workspaces
        </h1>
        <p className="text-sm text-muted-foreground text-pretty">
          One handles what the government needs from your business. The other
          handles what happens inside it every day.
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
