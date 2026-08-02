import Link from "next/link";

import { signInAction } from "@/features/auth/actions";
import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata = {
  title: "Sign in — NegosyoOS PH (prototype)",
};

export default function SignInPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground text-pretty">
          Use the email address and password you signed up with.
        </p>
      </div>

      <AuthForm
        action={signInAction}
        submitLabel="Sign in"
        pendingLabel="Signing in…"
      />

      <p className="text-sm text-muted-foreground">
        No account yet?{" "}
        <Link href="/sign-up" className="font-medium text-foreground underline underline-offset-4">
          Create one
        </Link>
        .
      </p>
    </div>
  );
}
