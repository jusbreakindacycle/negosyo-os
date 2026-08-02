import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

import type { BusinessSummary } from "./resolve-active-business";

/**
 * The businesses the signed-in person may use.
 *
 * There is deliberately no `.eq("user_id", ...)` filter here. The
 * `businesses_select_member` policy already restricts the result to businesses
 * the caller holds a membership for, so adding an application-level filter
 * would create a second, weaker place for the rule to live — and it would hide
 * a broken policy rather than surface one.
 *
 * Wrapped in `cache()` because both the app layout and the page beneath it
 * need this list, and they render in the same request.
 */
export const listMyBusinesses = cache(async (): Promise<BusinessSummary[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("id, name")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Could not load your businesses: ${error.message}`);
  }

  return data ?? [];
});

/**
 * Whether the signed-in person holds a membership for this business.
 *
 * Used before writing the active-business cookie. A caller who is not a member
 * simply gets no row back, because `business_memberships_select_own` filters
 * the query to their own memberships.
 */
export async function hasMembership(businessId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("business_memberships")
    .select("id")
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return data !== null;
}
