/**
 * Alinhado a `mensageiro.payments` (Supabase).
 * Consultas devem usar schema `mensageiro`, nunca assumir `public`.
 */

export const MENSAGEIRO_SCHEMA = "mensageiro" as const;
export const MENSAGEIRO_PAYMENTS_TABLE = "payments" as const;

export type MensageiroPaymentGateway = "mercado_pago" | "asaas";

export type MensageiroPaymentStatus =
  | "pending"
  | "paid"
  | "approved"
  | "failed"
  | "refunded"
  | string;

export type MensageiroPaymentRow = {
  id: string;
  gateway: MensageiroPaymentGateway;
  external_payment_id: string;
  amount: string;
  status: MensageiroPaymentStatus;
  confirmed_at: string | null;
  created_at: string;
};

/**
 * Cliente Supabase (após instalar @supabase/supabase-js), somente no servidor:
 *
 *   import { createClient } from "@supabase/supabase-js";
 *   const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
 *   const { data, error } = await supabase
 *     .schema(MENSAGEIRO_SCHEMA)
 *     .from(MENSAGEIRO_PAYMENTS_TABLE)
 *     .select("*")
 *     .eq("gateway", "mercado_pago")
 *     .eq("external_payment_id", paymentId)
 *     .maybeSingle();
 *
 * SQL direto (migrations / painel):
 *   SELECT * FROM mensageiro.payments WHERE gateway = 'mercado_pago' LIMIT 10;
 */
