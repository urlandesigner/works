import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { loadStoredValuesHidden, persistValuesHidden } from './storage';

type ValuesVisibilityContextValue = {
  isBalanceHidden: boolean;
  hydrated: boolean;
  toggleBalanceVisibility: () => void;
  setBalanceHidden: (hidden: boolean) => void;
};

const ValuesVisibilityContext = createContext<ValuesVisibilityContextValue | null>(null);

export function ValuesVisibilityProvider({ children }: { children: ReactNode }) {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const hidden = await loadStoredValuesHidden();
      if (!cancelled) {
        setIsBalanceHidden(hidden);
        setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setBalanceHidden = useCallback((hidden: boolean) => {
    setIsBalanceHidden(hidden);
    void persistValuesHidden(hidden);
  }, []);

  const toggleBalanceVisibility = useCallback(() => {
    setIsBalanceHidden((current) => {
      const next = !current;
      void persistValuesHidden(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isBalanceHidden,
      hydrated,
      toggleBalanceVisibility,
      setBalanceHidden,
    }),
    [hydrated, isBalanceHidden, setBalanceHidden, toggleBalanceVisibility],
  );

  return (
    <ValuesVisibilityContext.Provider value={value}>
      {children}
    </ValuesVisibilityContext.Provider>
  );
}

export function useValuesVisibility() {
  const context = useContext(ValuesVisibilityContext);
  if (!context) {
    throw new Error('useValuesVisibility must be used within ValuesVisibilityProvider');
  }
  return context;
}
