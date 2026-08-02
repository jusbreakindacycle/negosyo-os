import { redirect } from "next/navigation";

import { CreateBusinessForm } from "@/features/businesses/components/create-business-form";
import { listMyBusinesses } from "@/features/businesses/queries";
import { requireUser } from "@/lib/auth/current-user";

export const metadata = {
  title: "Set up your business — NegosyoOS PH (prototype)",
};

export default async function OnboardingPage() {
  await requireUser();

  // Someone who already has a business reached this page by typing the URL or
  // by using the back button. Send them where they meant to go.
  const businesses = await listMyBusinesses();
  if (businesses.length > 0) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Set up your business
        </h1>
        <p className="text-sm text-muted-foreground text-pretty">
          Start with one business. You can add another later if you run more
          than one.
        </p>
      </div>

      <CreateBusinessForm />

      <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
        Creating a business here only sets up your own records. It does not
        register anything with DTI, the BIR, your barangay, or your city hall.
      </p>
    </div>
  );
}
