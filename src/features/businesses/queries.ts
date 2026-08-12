import { supabase } from "@/lib/supabase/client";

import { describeCreateBusinessError } from "./create-business-errors";
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
 * Ported from the web client's request-scoped `cache()`-wrapped version. The
 * native client is one long-lived singleton rather than one client per
 * request, so there is no request boundary to memoise against; callers that
 * need to avoid a duplicate fetch do so with their own state (e.g. a screen's
 * `useEffect`/`useState`), not a wrapper here.
 */
export async function listMyBusinesses(): Promise<BusinessSummary[]> {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, name")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Could not load your businesses: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Whether the signed-in person holds a membership for this business.
 *
 * Used before storing the active-business preference. A caller who is not a
 * member simply gets no row back, because `business_memberships_select_own`
 * filters the query to their own memberships.
 */
export async function hasMembership(businessId: string): Promise<boolean> {
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

/**
 * Creates a business and its creator's owner membership in one transaction,
 * via the unchanged `create_business_with_owner` RPC (see
 * `supabase/migrations/20260731125416_create_business_with_owner_function.sql`).
 * There is no path that writes these tables separately — `authenticated`
 * holds no INSERT grant on any of them.
 *
 * The RPC also refuses a fourth business whose status is not `closed`
 * (DL-055 item 6, migration `20260813090000_limit_active_businesses_per_owner`).
 * That refusal is not currently reachable from any screen — this is the only
 * caller, and the onboarding screen it belongs to redirects away once the
 * person has a business. It is mapped here regardless, because the RPC is
 * callable directly through the Data API by anyone holding a valid
 * `authenticated` token, which is the abuse the ceiling exists to stop.
 */
export async function createBusiness(
  name: string,
): Promise<{ business: BusinessSummary | null; error: string | null }> {
  const { data, error } = await supabase.rpc("create_business_with_owner", {
    p_name: name,
  });

  if (error) {
    return { business: null, error: describeCreateBusinessError(error.message) };
  }

  return { business: { id: data.id, name: data.name }, error: null };
}
