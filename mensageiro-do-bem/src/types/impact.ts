export type ImpactStats = {
  /** Soma de `mensageiro.payments.amount` com `status = 'paid'` (fonte: Supabase via API). */
  totalArrecadado: number;
  /** Meta em reais para a barra e para “faltam R$ …” (atualmente R$50). */
  meta: number;
};

export type ImpactViewModel = {
  title: string;
  highlightedAmount: string;
  amountComplement: string;
  progressHint: string;
  regraDoacaoLabel: string;
  belongingLine: string;
  ctaLine: string;
  progressPercentage: number;
  primeiraDoacaoRealizada: boolean;
  primeiraDoacaoLabel: string;
};
