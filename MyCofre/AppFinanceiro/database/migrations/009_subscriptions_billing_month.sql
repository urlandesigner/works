-- Suporte a assinaturas anuais com dia + mês.
-- Execute no SQL Editor do Supabase (após 007_subscriptions_supabase.sql).

alter table public.subscriptions
  add column if not exists billing_month int;

-- Opcional (não habilitado): validação no banco para periodicidade anual.
-- Observação: habilitar esse CHECK pode quebrar registros anuais existentes sem billing_month.
-- alter table public.subscriptions
--   add constraint subscriptions_billing_month_required_for_annual
--   check (periodicity <> 'annual' or billing_month is not null);

-- Opcional: restringir faixa (deixe comentado se preferir só validação no app)
-- alter table public.subscriptions
--   add constraint subscriptions_billing_month_range_check
--   check (billing_month is null or (billing_month >= 1 and billing_month <= 12));

