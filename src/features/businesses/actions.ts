"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { createBusinessSchema } from "@/lib/validation/business";

import { setActiveBusinessCookie } from "./active-business";
import type { CreateBusinessState } from "./form-state";
import { hasMembership } from "./queries";

export async function createBusinessAction(
  _prevState: CreateBusinessState,
  formData: FormData,
): Promise<CreateBusinessState> {
  // Checked here, not only in the Proxy: Next.js routes a Server Function as a
  // POST to its host page, so proxy coverage is not guaranteed.
  await requireUser();

  const parsed = createBusinessSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Enter a business name.",
    };
  }

  const supabase = await createClient();

  // The RPC creates the business, the owner membership, and the audit event in
  // one transaction. There is no path that writes these tables separately —
  // `authenticated` holds no INSERT grant on any of them.
  const { data, error } = await supabase.rpc("create_business_with_owner", {
    p_name: parsed.data.name,
  });

  if (error) {
    if (error.message.includes("auth_required")) {
      redirect("/sign-in");
    }

    if (error.message.includes("invalid_business_name")) {
      return { error: "Enter a business name between 2 and 160 characters." };
    }

    return { error: "We could not create that business. Please try again." };
  }

  await setActiveBusinessCookie(data.id);
  revalidatePath("/", "layout");

  redirect("/dashboard");
}

/**
 * Switches the active business after re-checking membership.
 *
 * Row Level Security would already return nothing for a business the caller
 * has no membership for, so this check is not the only lock. It is what keeps
 * the cookie from being set to an id the person cannot actually open, which
 * would leave them staring at an empty screen with no explanation.
 */
export async function switchBusinessAction(formData: FormData) {
  await requireUser();

  const businessId = formData.get("businessId");

  if (typeof businessId !== "string" || businessId.length === 0) {
    redirect("/dashboard");
  }

  if (!(await hasMembership(businessId))) {
    // No error message: this is either a stale tab or a forged request, and
    // neither deserves a hint about whether the business exists.
    redirect("/dashboard");
  }

  await setActiveBusinessCookie(businessId);
  revalidatePath("/", "layout");

  redirect("/dashboard");
}
