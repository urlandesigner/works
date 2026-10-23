import { createContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '@/integrations/supabase/client';
import { USE_MOCKS } from '@/config';
import { readLocalStorageJSON, writeLocalStorageJSON } from '@/lib/local-storage';

export interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const MOCK_SESSION_STORAGE_KEY = 'udlabs.analytics.mock.session.v1';

// Sessão fake em modo mock: deixa a Home acessível sem backend de auth.
function createMockSession(email = 'admin@udlabs.local'): Session {
  return { user: { id: 'mock-user', email } } as unknown as Session;
}

function getInitialMockSession() {
  const saved = readLocalStorageJSON<{ email: string } | null>(MOCK_SESSION_STORAGE_KEY, {
    email: 'admin@udlabs.local',
  });
  return saved ? createMockSession(saved.email) : null;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(USE_MOCKS ? getInitialMockSession() : null);
  const [loading, setLoading] = useState(!USE_MOCKS);

  useEffect(() => {
    if (USE_MOCKS) return;

    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      async signIn(email, password) {
        if (USE_MOCKS) {
          setSession(createMockSession(email));
          writeLocalStorageJSON(MOCK_SESSION_STORAGE_KEY, { email });
          return;
        }
        const { error } = await getSupabase().auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async signOut() {
        if (USE_MOCKS) {
          setSession(null);
          writeLocalStorageJSON(MOCK_SESSION_STORAGE_KEY, null);
          return;
        }
        await getSupabase().auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
