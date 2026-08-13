/**
 * The four ways an owner can answer "where is this business right now?".
 *
 * Data rather than JSX, and free of any Expo/React Native/Supabase import, so
 * the mapping is covered by a test instead of being buried in a screen.
 *
 * Note what is **not** here: the lifecycle status. This module produces only
 * the two facts the owner actually stated — whether the business is open, and
 * how far registration has got. `create_business_with_owner` derives the
 * status from those, and DL-063 makes that derivation authoritative there
 * precisely so it does not also exist here as a client convention. If you find
 * yourself computing `draft` or `operating` in this file, that is the bug.
 */

import type { RegistrationStatus } from "./business-mode";

export type EntryChoiceId =
  | "preparing"
  | "registering"
  | "operating_registered"
  | "operating_informal";

export type RegistrationOption = {
  value: RegistrationStatus;
  label: string;
};

export type EntryChoice = {
  id: EntryChoiceId;
  title: string;
  detail: string;
  /** Sent as `p_is_operating`. The owner's statement that they are trading. */
  isOperating: boolean;
  /**
   * The registration answer this choice already implies, or `null` when the
   * choice needs a follow-up question.
   */
  registrationStatus: RegistrationStatus | null;
  /** Follow-up options. Empty when `registrationStatus` is fixed. */
  registrationOptions: RegistrationOption[];
  /**
   * Whether to offer the registered-name field. Only asked where a registered
   * name could plausibly exist — asking a business that has filed nothing for
   * its DTI name is asking it to invent one.
   */
  asksLegalName: boolean;
};

const PREFER_NOT_TO_SAY: RegistrationOption = {
  value: "unknown",
  label: "I'd rather not say yet",
};

export const ENTRY_CHOICES: readonly EntryChoice[] = [
  {
    id: "preparing",
    title: "Not open yet — I'm still preparing",
    detail: "You are planning or setting up, and you have not started selling.",
    isOperating: false,
    registrationStatus: "not_started",
    registrationOptions: [],
    asksLegalName: false,
  },
  {
    id: "registering",
    title: "Not open yet — but registration has started",
    detail:
      "You have begun or finished registering, and the business is not trading yet.",
    isOperating: false,
    registrationStatus: null,
    registrationOptions: [
      { value: "in_progress", label: "Registration is in progress" },
      { value: "complete", label: "Registration is finished" },
      PREFER_NOT_TO_SAY,
    ],
    asksLegalName: true,
  },
  {
    id: "operating_registered",
    title: "Already open — and registered",
    detail: "You are selling or serving customers, and registration is done.",
    isOperating: true,
    registrationStatus: "complete",
    registrationOptions: [],
    asksLegalName: true,
  },
  {
    id: "operating_informal",
    title: "Already open — registration is not complete",
    detail:
      "You are already selling or serving customers. NegosyoOS works either way.",
    isOperating: true,
    registrationStatus: null,
    registrationOptions: [
      { value: "not_started", label: "I have not started registering" },
      { value: "in_progress", label: "Registration is in progress" },
      PREFER_NOT_TO_SAY,
    ],
    asksLegalName: false,
  },
];

export function findEntryChoice(id: EntryChoiceId): EntryChoice {
  const choice = ENTRY_CHOICES.find((c) => c.id === id);

  if (choice === undefined) {
    throw new Error(`Unknown entry choice: ${id}`);
  }

  return choice;
}

/**
 * The registration value to send for a choice and its follow-up answer.
 *
 * An unanswered follow-up is `unknown` rather than a guess. That is the whole
 * reason `unknown` is a real enum value: when the fact is missing, the product
 * says so instead of filling it in.
 */
export function resolveRegistrationStatus(
  choice: EntryChoice,
  selected: RegistrationStatus | null,
): RegistrationStatus {
  if (choice.registrationStatus !== null) {
    return choice.registrationStatus;
  }

  return selected ?? "unknown";
}
