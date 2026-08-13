import { supabase } from "@/lib/supabase/client";

import type { BusinessStatus, RegistrationStatus } from "./business-mode";
import {
  describeCreateBusinessError,
  describeStatusChangeError,
} from "./create-business-errors";
import type { BusinessSummary } from "./resolve-active-business";

/**
 * Everything the business row carries that the interface reads. Selected in one
 * place so a screen cannot quietly start depending on a column the list query
 * does not fetch — which is exactly how `status` came to be modelled in the
 * database and invisible to the client for eleven days (DL-060).
 */
const BUSINESS_COLUMNS = "id, name, status, registration_status, legal_name";

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
    .select(BUSINESS_COLUMNS)
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

/** What onboarding collected. The lifecycle status is deliberately absent. */
export type CreateBusinessInput = {
  name: string;
  /** The owner's statement that the business is already trading. */
  isOperating: boolean;
  registrationStatus: RegistrationStatus;
  legalName: string | null;
};

/**
 * Creates a business and its creator's owner membership in one transaction,
 * via `create_business_with_owner` (see
 * `supabase/migrations/20260813141500_business_lifecycle_rpcs.sql`). There is no
 * path that writes these tables separately — `authenticated` holds no INSERT
 * grant on any of them.
 *
 * **No lifecycle status is sent, and none may be added here.** The RPC derives
 * it from `isOperating` and `registrationStatus`, and DL-063 puts that mapping
 * there so it exists once. A client that computed `draft` or `operating` itself
 * would be a second copy of the rule, free to disagree with the first.
 *
 * The RPC also refuses a fourth business whose status is not `closed`
 * (DL-055 item 6). That refusal is not reachable from any screen — onboarding
 * redirects away once the person has a usable business, and no "add another
 * business" control exists yet (DL-063, D-2). It is mapped regardless, because
 * the RPC is callable directly through the Data API by anyone holding a valid
 * `authenticated` token, which is the abuse the ceiling exists to stop.
 */
export async function createBusiness(
  input: CreateBusinessInput,
): Promise<{ business: BusinessSummary | null; error: string | null }> {
  const { data, error } = await supabase.rpc("create_business_with_owner", {
    p_name: input.name,
    p_is_operating: input.isOperating,
    p_registration_status: input.registrationStatus,
    p_legal_name: input.legalName ?? undefined,
  });

  if (error) {
    return { business: null, error: describeCreateBusinessError(error.message) };
  }

  return { business: toSummary(data), error: null };
}

/**
 * Records the owner's declaration that a business has started operating.
 *
 * DL-031 made the mayor's permit the trigger for this transition; Permits is
 * two milestones away, so until it ships the owner may say so themselves
 * (DL-060 item 4). This is a statement about operating reality and certifies
 * nothing — no screen may present it as a compliance claim.
 *
 * The legal transition set lives in the RPC, not here. This function can ask
 * for anything; the database is what decides.
 */
export async function declareBusinessStatus(
  businessId: string,
  status: BusinessStatus,
): Promise<{ business: BusinessSummary | null; error: string | null }> {
  const { data, error } = await supabase.rpc("declare_business_status", {
    p_business_id: businessId,
    p_status: status,
  });

  if (error) {
    return { business: null, error: describeStatusChangeError(error.message) };
  }

  return { business: toSummary(data), error: null };
}

type BusinessRow = {
  id: string;
  name: string;
  status: BusinessStatus;
  registration_status: RegistrationStatus;
  legal_name: string | null;
};

function toSummary(row: BusinessRow): BusinessSummary {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    registration_status: row.registration_status,
    legal_name: row.legal_name,
  };
}
