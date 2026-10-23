export const MOCK_DATA_CHANGED_EVENT = 'udlabs:mock-data-changed';

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readLocalStorageJSON<T>(key: string, fallback: T): T {
  if (!canUseLocalStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeLocalStorageJSON<T>(key: string, value: T) {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignora falhas de quota/storage no modo mock.
  }
}

export function emitMockDataChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(MOCK_DATA_CHANGED_EVENT));
}
