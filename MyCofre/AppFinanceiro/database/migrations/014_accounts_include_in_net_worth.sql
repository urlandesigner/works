-- Contas podem ser usadas só para classificar lançamentos, sem compor o "caixa"
-- do patrimônio líquido (visão geral / metas net_worth).
-- Default true mantém o comportamento atual para todas as contas existentes.

alter table public.accounts
  add column if not exists include_in_net_worth boolean not null default true;

update public.accounts
set include_in_net_worth = coalesce(include_in_net_worth, true)
where include_in_net_worth is null;
