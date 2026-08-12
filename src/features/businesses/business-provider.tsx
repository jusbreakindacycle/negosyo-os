import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/features/auth/auth-provider";

import { hasMembership, listMyBusinesses } from "./queries";
import {
  resolveActiveBusiness,
  resolveActiveBusinessId,
  type BusinessSummary,
} from "./resolve-active-business";
import { readActiveBusinessId, setActiveBusinessId } from "./store";

type BusinessState = {
  businesses: BusinessSummary[];
  activeBusiness: BusinessSummary | null;
  loading: boolean;
  /** Re-fetches the business list, e.g. after creating a business. */
  refresh: () => void;
  /**
   * Switches the active business after re-checking membership.
   *
   * Row Level Security would already return nothing for a business the
   * caller has no membership for, so this check is not the only lock — see
   * `src/features/businesses/queries.ts`. It is what keeps the stored
   * preference from naming a business the person cannot actually open.
   */
  switchBusiness: (businessId: string) => Promise<void>;
};

const BusinessContext = createContext<BusinessState | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<BusinessSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  // Bumped by refresh() to re-run the effect below without duplicating its
  // fetch logic in a second, directly-called function.
  const [reloadToken, setReloadToken] = useState(0);

  // Every setState call below lives inside a `.then()` callback, never in the
  // effect's own synchronous execution — the same shape `auth-provider.tsx`
  // already uses. Calling an async function directly from the effect body
  // would run that function's code up to its first `await` synchronously,
  // which is exactly what `react-hooks/set-state-in-effect` flags.
  useEffect(() => {
    let cancelled = false;

    if (!session) {
      Promise.resolve().then(() => {
        if (cancelled) return;
        setBusinesses([]);
        setActiveBusiness(null);
        setLoading(false);
      });

      return () => {
        cancelled = true;
      };
    }

    Promise.all([listMyBusinesses(), readActiveBusinessId()]).then(
      ([list, storedId]) => {
        if (cancelled) return;
        setBusinesses(list);
        setActiveBusiness(resolveActiveBusiness(storedId, list));
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [session, reloadToken]);

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  async function switchBusiness(businessId: string) {
    if (!(await hasMembership(businessId))) {
      // No error surfaced: this is either a stale local value or a forged
      // request, and neither deserves a hint about whether the business
      // exists.
      return;
    }

    await setActiveBusinessId(businessId);
    setActiveBusiness(resolveActiveBusiness(businessId, businesses));
  }

  return (
    <BusinessContext.Provider
      value={{ businesses, activeBusiness, loading, refresh, switchBusiness }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinesses(): BusinessState {
  const context = useContext(BusinessContext);

  if (context === undefined) {
    throw new Error("useBusinesses must be used within a BusinessProvider");
  }

  return context;
}

// Re-exported so screens resolving an id without the provider (rare) can
// still use the same logic the provider uses internally.
export { resolveActiveBusinessId };
