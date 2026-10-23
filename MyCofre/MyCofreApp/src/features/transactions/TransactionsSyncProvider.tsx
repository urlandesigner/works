import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type TransactionsSyncContextValue = {
  refreshKey: number;
  notifyTransactionsChanged: () => void;
};

const TransactionsSyncContext = createContext<TransactionsSyncContextValue | null>(null);

export function TransactionsSyncProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const value = useMemo<TransactionsSyncContextValue>(
    () => ({
      refreshKey,
      notifyTransactionsChanged: () => {
        setRefreshKey((current) => current + 1);
      },
    }),
    [refreshKey],
  );

  return (
    <TransactionsSyncContext.Provider value={value}>
      {children}
    </TransactionsSyncContext.Provider>
  );
}

export function useTransactionsSync(): TransactionsSyncContextValue {
  const ctx = useContext(TransactionsSyncContext);
  if (!ctx) {
    throw new Error('useTransactionsSync must be used within TransactionsSyncProvider');
  }
  return ctx;
}
