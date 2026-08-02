import { switchBusinessAction } from "@/features/businesses/actions";
import type { BusinessSummary } from "@/features/businesses/resolve-active-business";

type BusinessSwitcherProps = {
  businesses: readonly BusinessSummary[];
  activeBusinessId: string | null;
};

/**
 * Shows the current business and, when there is more than one, lets the owner
 * move between them.
 *
 * `businesses` always arrives from `listMyBusinesses()`, so the list is
 * whatever Row Level Security returned — there is no way to render a business
 * the person is not a member of.
 *
 * A plain form rather than a dropdown: switching reloads server data either
 * way, and this keeps the whole thing working without client JavaScript.
 */
export function BusinessSwitcher({
  businesses,
  activeBusinessId,
}: BusinessSwitcherProps) {
  const active = businesses.find((b) => b.id === activeBusinessId) ?? null;

  if (businesses.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No business set up yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Business:{" "}
        <span className="font-medium text-foreground">
          {active?.name ?? "None selected"}
        </span>
      </p>

      {businesses.length > 1 ? (
        <div className="flex flex-wrap gap-1.5">
          {businesses.map((business) => (
            <form key={business.id} action={switchBusinessAction}>
              <input type="hidden" name="businessId" value={business.id} />
              <button
                type="submit"
                aria-current={business.id === activeBusinessId ? "true" : undefined}
                className="rounded-full border px-2.5 py-0.5 text-xs whitespace-nowrap transition-colors hover:bg-muted aria-[current]:border-foreground/40 aria-[current]:bg-muted aria-[current]:font-medium"
              >
                {business.name}
              </button>
            </form>
          ))}
        </div>
      ) : null}
    </div>
  );
}
