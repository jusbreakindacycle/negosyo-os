/**
 * What a business's lifecycle state means for the interface.
 *
 * Kept free of any Expo, React Native, or Supabase import, for the same reason
 * `resolve-active-business.ts` is: this is the rule that decides which
 * experience an owner gets, so it should be testable on its own.
 *
 * Mode is **derived**, never stored (DL-031, restated by DL-063). A second
 * column recording "which mode is this business in" would be a second source of
 * truth for the same fact, and the two would drift.
 */

import type { Database } from "@/types/database";

export type BusinessStatus = Database["public"]["Enums"]["business_status"];
export type RegistrationStatus =
  Database["public"]["Enums"]["business_registration_status"];

export type BusinessMode = "setup" | "running" | "closed";

/**
 * Setup mode answers "what do I need to do to become ready?"; Running mode
 * answers "what needs my attention now?".
 *
 * `registration_status` is deliberately not a parameter. A business that is
 * trading is in Running mode whether or not its registration is finished —
 * that is what keeps an informal operator a first-class user rather than
 * someone the product treats as not really open.
 *
 * `closed` gets its own value rather than falling through to `setup`. A closed
 * business being told "let's get you ready to open" would be the product
 * misreading its own data.
 */
export function deriveBusinessMode(status: BusinessStatus): BusinessMode {
  switch (status) {
    case "operating":
      return "running";
    case "closed":
      return "closed";
    case "draft":
    case "registering":
      return "setup";
  }
}

/**
 * Owner-facing wording for a lifecycle state.
 *
 * Here rather than in a screen so the words are covered by a test. Every one of
 * them describes what the owner told us, never what any government office has
 * decided.
 */
export const BUSINESS_STATUS_LABEL: Record<BusinessStatus, string> = {
  draft: "Getting ready",
  registering: "Getting ready — registration started",
  operating: "Open",
  closed: "Closed",
};

/**
 * Owner-facing wording for registration progress.
 *
 * DL-063 makes this a standing rule, not a style preference: this value is the
 * owner's own statement, recorded once during setup and never verified. It must
 * never render as "registered", "compliant", "approved", or "eligible", and
 * `not_started` must never be phrased as a failing. Every string below says
 * what was recorded, and says when it was recorded, because nothing updates it
 * until Permits ships (DL-063 item A-5).
 */
export const REGISTRATION_STATUS_LABEL: Record<RegistrationStatus, string> = {
  unknown: "No registration progress was recorded during setup.",
  not_started:
    "Recorded during setup: registration had not been started. You can keep using NegosyoOS.",
  in_progress: "Recorded during setup: registration was in progress.",
  complete: "Recorded during setup: registration was finished.",
};

/**
 * Whether to show the registration note at all.
 *
 * Shown for everything except `complete`, where repeating it every day would
 * only be noise. It is a reminder of something recorded, never a warning.
 */
export function shouldShowRegistrationNote(
  registrationStatus: RegistrationStatus,
): boolean {
  return registrationStatus !== "complete";
}
