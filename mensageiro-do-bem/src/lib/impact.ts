import { IMPACT_META_BRL } from "@/constants/impact";
import { DEFAULT_PAYMENT_AMOUNT } from "@/constants/receber";
import type { ImpactStats, ImpactViewModel } from "@/types/impact";

function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Card de impacto: total vem do Supabase (soma `paid`).
 * Meta fixa R$50: barra = total/meta (teto 100%), restante = max(meta - total, 0).
 */
export function buildImpactViewModel(stats: ImpactStats): ImpactViewModel {
  const meta = stats.meta > 0 ? stats.meta : IMPACT_META_BRL;
  const totalArrecadado = Math.max(0, Number(stats.totalArrecadado) || 0);
  const restante = Math.max(meta - totalArrecadado, 0);
  const progressPercentage = clamp((totalArrecadado / meta) * 100, 0, 100);

  const metaLabel = Number.isInteger(meta)
    ? `R$${meta}`
    : formatCurrencyBRL(meta);
  const restanteLabel = formatCurrencyBRL(restante);
  const contributionLabel = formatCurrencyBRL(DEFAULT_PAYMENT_AMOUNT);

  const progressHint =
    restante > 0
      ? `Faltam ${restanteLabel} para a próxima ajuda.`
      : `A meta de ${metaLabel} para a próxima ajuda foi atingida.`;

  return {
    title: "Pequenos valores, impacto real",
    highlightedAmount: `${formatCurrencyBRL(totalArrecadado)} arrecadados até agora`,
    amountComplement: "",
    progressHint,
    regraDoacaoLabel: `Quando o total atinge ${metaLabel}, realizamos uma ação de ajuda.`,
    belongingLine: "Você está aqui desde o começo",
    ctaLine: `Com ${contributionLabel}, você contribui — e recebe sua mensagem.`,
    progressPercentage,
    primeiraDoacaoRealizada: totalArrecadado > 0,
    primeiraDoacaoLabel: "💛 A primeira ajuda já aconteceu",
  };
}
