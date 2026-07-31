"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  initialAuthFormState,
  type AuthFormState,
} from "@/features/auth/form-state";

type AuthFormProps = {
  action: (
    prevState: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
  submitLabel: string;
  pendingLabel: string;
  /** Shown under the password field on sign-up, where the rule applies. */
  passwordHint?: string;
  newPassword?: boolean;
};

export function AuthForm({
  action,
  submitLabel,
  pendingLabel,
  passwordHint,
  newPassword = false,
}: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialAuthFormState,
  );

  if (state.status === "check-email") {
    return (
      <div
        role="status"
        className="rounded-lg border border-dashed px-3 py-4 text-sm text-pretty"
      >
        <p className="font-medium">Check your email.</p>
        <p className="mt-1 text-muted-foreground">
          We sent you a confirmation link. Open it on this device to finish
          setting up your account.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          aria-invalid={state.error !== null}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={newPassword ? "new-password" : "current-password"}
          required
          aria-invalid={state.error !== null}
          aria-describedby={passwordHint ? "password-hint" : undefined}
        />
        {passwordHint ? (
          <p id="password-hint" className="text-xs text-muted-foreground">
            {passwordHint}
          </p>
        ) : null}
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-destructive text-pretty">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
