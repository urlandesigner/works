import "server-only";

import {
  MENSAGEIRO_SCHEMA,
  MENSAGEIRO_PAYMENTS_TABLE,
  type MensageiroPaymentGateway,
} from "@/types/mensageiro-payments";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

const PAID_STATUS = "paid" as const;
const PENDING_STATUS = "pending" as const;

/** Destino explícito da escrita: schema `mensageiro`, tabela `payments` (não `public.payments`). */
const PAYMENTS_FQN = `${MENSAGEIRO_SCHEMA}.${MENSAGEIRO_PAYMENTS_TABLE}` as const;

function logPendingInsertError(
  payload: Record<string, unknown>,
  err: { message: string; code?: string; details?: string; hint?: string },
): void {
  console.error("[payments] pending insert error", {
    ...payload,
    supabase: {
      message: err.message,
      code: err.code ?? null,
      details: err.details ?? null,
      hint: err.hint ?? null,
    },
  });
}

function isUniqueViolation(err: {
  code?: string;
  message?: string;
  details?: string;
}): boolean {
  if (err.code === "23505") return true;
  const msg = `${err.message ?? ""} ${err.details ?? ""}`.toLowerCase();
  return msg.includes("duplicate") || msg.includes("unique");
}

/**
 * Garante linha `pending` (insert; duplicata em gateway+external_payment_id é ignorada de forma explícita).
 * Use após PIX/cobrança criada com sucesso no gateway.
 *
 * Escreve sempre em `mensageiro.payments` via `.schema("mensageiro").from("payments")` + service role.
 */
export async function createPendingPayment(input: {
  gateway: MensageiroPaymentGateway;
  external_payment_id: string;
  amount: number;
}): Promise<void> {
  const sb = getSupabaseServiceRoleClient();
  if (!sb) {
    logPendingInsertError(
      {
        target: PAYMENTS_FQN,
        gateway: input.gateway,
        external_payment_id: input.external_payment_id,
        reason: "supabase_not_configured",
      },
      {
        message:
          "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente do servidor (ex.: .env.local). A chave anon não substitui a service role para esta rota.",
      },
    );
    return;
  }

  const row = {
    gateway: input.gateway,
    external_payment_id: input.external_payment_id,
    amount: input.amount,
    status: PENDING_STATUS,
    confirmed_at: null,
  };

  const { error } = await sb
    .schema(MENSAGEIRO_SCHEMA)
    .from(MENSAGEIRO_PAYMENTS_TABLE)
    .insert(row);

  if (error) {
    if (isUniqueViolation(error)) {
      return;
    }

    logPendingInsertError(
      {
        target: PAYMENTS_FQN,
        gateway: input.gateway,
        external_payment_id: input.external_payment_id,
      },
      error,
    );
    return;
  }
}

export async function markPaymentAsPaid(input: {
  gateway: MensageiroPaymentGateway;
  external_payment_id: string;
}): Promise<void> {
  const sb = getSupabaseServiceRoleClient();
  if (!sb) {
    console.warn(
      "[mensageiro.payments] markPaymentAsPaid skipped: Supabase não configurado",
    );
    return;
  }

  const confirmedAt = new Date().toISOString();
  const { data, error } = await sb
    .schema(MENSAGEIRO_SCHEMA)
    .from(MENSAGEIRO_PAYMENTS_TABLE)
    .update({
      status: PAID_STATUS,
      confirmed_at: confirmedAt,
    })
    .eq("gateway", input.gateway)
    .eq("external_payment_id", input.external_payment_id)
    .select("id");

  if (error) {
    console.error("[mensageiro.payments] markPaymentAsPaid falhou:", {
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return;
  }

  const rows = Array.isArray(data) ? data : data ? [data] : [];
  if (rows.length === 0) {
    console.warn("[mensageiro.payments] markPaymentAsPaid: nenhuma linha atualizada", {
      gateway: input.gateway,
      external_payment_id: input.external_payment_id,
    });
    return;
  }
}

export async function getTotalArrecadado(): Promise<number | null> {
  const sb = getSupabaseServiceRoleClient();
  if (!sb) return null;

  const { data, error } = await sb
    .schema(MENSAGEIRO_SCHEMA)
    .from(MENSAGEIRO_PAYMENTS_TABLE)
    .select("amount")
    .eq("status", PAID_STATUS);

  if (error) {
    console.error("[mensageiro.payments] getTotalArrecadado:", error.message);
    return null;
  }

  return (data ?? []).reduce((sum, row: { amount: unknown }) => {
    const n = Number(row.amount);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
}

export function providerParamToGateway(
  provider: "mercado-pago" | "asaas",
): MensageiroPaymentGateway {
  return provider === "mercado-pago" ? "mercado_pago" : "asaas";
}
