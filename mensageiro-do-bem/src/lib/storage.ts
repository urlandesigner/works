const STORAGE_KEY = "mdb-delivered-messages";
const MAX_ITEMS = 20;

export type DeliveredMessage = {
  id: string;
  content: string;
  category: string;
  createdAt: number;
};

function isDeliveredMessage(x: unknown): x is DeliveredMessage {
  if (x === null || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.content === "string" &&
    typeof o.category === "string" &&
    typeof o.createdAt === "number"
  );
}

export function getHistory(): DeliveredMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(isDeliveredMessage);
  } catch {
    return [];
  }
}

/** Acrescenta ao histórico e mantém no máximo {@link MAX_ITEMS} itens (remove os mais antigos). */
export function saveMessage(message: DeliveredMessage): void {
  if (typeof window === "undefined") return;
  const prev = getHistory();
  const next = [...prev, message];
  const trimmed =
    next.length > MAX_ITEMS ? next.slice(next.length - MAX_ITEMS) : next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}
