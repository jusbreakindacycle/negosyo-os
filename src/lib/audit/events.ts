/**
 * Audit event vocabulary and metadata filtering.
 *
 * `docs/TECHNICAL_FOUNDATION.md` section 12 forbids storing passwords, OTPs,
 * tokens, or unnecessary sensitive content in audit records. A database
 * constraint cannot tell a business name from a TIN, so the filter is here and
 * everything that writes an audit event goes through it.
 */

export const AUDIT_DOMAIN = {
  shared: "shared",
  startComply: "start_comply",
  operateDecide: "operate_decide",
} as const;

export type AuditDomain = (typeof AUDIT_DOMAIN)[keyof typeof AUDIT_DOMAIN];

export const AUDIT_ACTION = {
  businessCreated: "business.created",
} as const;

export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];

/**
 * The only keys allowed into `audit_events.metadata`.
 *
 * An allow-list rather than a deny-list: a deny-list is only as good as the
 * last time somebody remembered to extend it, and the cost of being wrong here
 * is personal data written to a table that is never deleted.
 */
const ALLOWED_METADATA_KEYS = new Set([
  "business_name",
  "entity_label",
  "previous_status",
  "next_status",
  "source",
]);

export type AuditMetadataValue = string | number | boolean | null;

/**
 * Drops every key that is not explicitly allowed, and every value that is not
 * a plain scalar. Nested objects are refused outright — that is how a whole
 * form payload ends up in an audit row by accident.
 */
export function buildAuditMetadata(
  input: Record<string, unknown>,
): Record<string, AuditMetadataValue> {
  const result: Record<string, AuditMetadataValue> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!ALLOWED_METADATA_KEYS.has(key)) {
      continue;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      result[key] = value;
    }
  }

  return result;
}
