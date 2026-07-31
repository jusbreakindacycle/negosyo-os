import Link from "next/link";

import { signUpAction } from "@/features/auth/actions";
import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata = {
  title: "Create an account — NegosyoOS PH (prototype)",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground text-pretty">
          You will set up your business on the next screen. Nothing is filed
          with any government office.
        </p>
      </div>

      <AuthForm
        action={signUpAction}
        submitLabel="Create account"
        pendingLabel="Creating account…"
        passwordHint="At least 8 characters."
        newPassword
      />

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-foreground underline underline-offset-4">
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
