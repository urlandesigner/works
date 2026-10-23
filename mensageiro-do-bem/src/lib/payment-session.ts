export const PAYMENT_SESSION_STORAGE_KEY = "mdb_payment_session";

export type PaymentSessionStatus = "pending" | "confirmed";

export type PaymentProvider = "mercado-pago" | "asaas";

export type PaymentSession = {
  paymentId: string;
  paymentStatus: PaymentSessionStatus;
  createdAt: string;
  amount?: number;
  /** Gateway usado na cobrança atual (para consulta de status no servidor). */
  paymentProvider?: PaymentProvider;
  /** Preenchido após pagamento confirmado, antes de abrir /mensagem */
  messageId?: string;
};

export function readPaymentSession(): PaymentSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PAYMENT_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return null;
    const rec = o as Record<string, unknown>;
    const paymentId =
      typeof rec.paymentId === "string" ? rec.paymentId.trim() : "";
    if (!paymentId) return null;
    const st = rec.paymentStatus;
    if (st !== "pending" && st !== "confirmed") return null;
    const createdAt = typeof rec.createdAt === "string" ? rec.createdAt : "";
    if (!createdAt) return null;
    const messageId =
      typeof rec.messageId === "string" && rec.messageId.trim()
        ? rec.messageId.trim()
        : undefined;
    const amount =
      typeof rec.amount === "number" && Number.isFinite(rec.amount)
        ? rec.amount
        : undefined;
    const paymentProvider =
      rec.paymentProvider === "mercado-pago" || rec.paymentProvider === "asaas"
        ? rec.paymentProvider
        : undefined;
    return {
      paymentId,
      paymentStatus: st,
      createdAt,
      amount,
      paymentProvider,
      messageId,
    };
  } catch {
    return null;
  }
}

export function writePaymentSession(session: PaymentSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PAYMENT_SESSION_STORAGE_KEY,
      JSON.stringify(session),
    );
  } catch {
    /* quota / modo privado */
  }
}

export function clearPaymentSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PAYMENT_SESSION_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
