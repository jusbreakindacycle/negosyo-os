"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createBusinessAction } from "@/features/businesses/actions";
import { initialCreateBusinessState } from "@/features/businesses/form-state";

export function CreateBusinessForm() {
  const [state, formAction, isPending] = useActionState(
    createBusinessAction,
    initialCreateBusinessState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Business name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="organization"
          maxLength={160}
          required
          aria-invalid={state.error !== null}
          aria-describedby="name-hint"
        />
        <p id="name-hint" className="text-xs text-muted-foreground text-pretty">
          Use the name you actually trade under. You can keep this the same as
          your registered name or different — nothing here is filed anywhere.
        </p>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-destructive text-pretty">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Creating…" : "Create business"}
      </Button>
    </form>
  );
}
