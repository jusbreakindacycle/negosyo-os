import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/lib/supabase/client";

type AuthState = {
  session: Session | null;
  /** True only until the first session check resolves. */
  loading: boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

/**
 * Makes the current session available to the router.
 *
 * Route protection here is navigation convenience, matching the standing
 * project rule: Row Level Security is the actual authorisation boundary, not
 * this provider or where it redirects. See `src/lib/supabase/client.ts` and
 * `docs/TECHNICAL_FOUNDATION.md` §11.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setLoading(false);
      },
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
