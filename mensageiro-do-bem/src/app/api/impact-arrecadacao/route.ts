import { NextResponse } from "next/server";
import { IMPACT_META_BRL } from "@/constants/impact";
import { getTotalArrecadado } from "@/lib/payments/repository";

/**
 * Total arrecadado: soma de `mensageiro.payments.amount` com `status = 'paid'` (única fonte do card).
 * Se Supabase estiver indisponível ou não configurado, devolve `totalArrecadado: 0` (sem número fictício).
 */
export async function GET() {
  const total = await getTotalArrecadado();
  if (total === null) {
    return NextResponse.json({
      totalArrecadado: 0,
      meta: IMPACT_META_BRL,
      source: "fallback" as const,
      supabaseConfigured: false,
    });
  }
  return NextResponse.json({
    totalArrecadado: total,
    meta: IMPACT_META_BRL,
    source: "supabase" as const,
    supabaseConfigured: true,
  });
}
