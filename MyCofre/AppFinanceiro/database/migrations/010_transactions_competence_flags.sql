-- Competência vs caixa: compras no cartão (via fatura) e pagamento de fatura no resumo mensal.
alter table public.transactions
  add column if not exists credit_card_id uuid references public.credit_cards (id) on delete set null;

alter table public.transactions
  add column if not exists exclude_from_month_expense_summary boolean not null default false;

create index if not exists transactions_credit_card_id_idx
  on public.transactions (credit_card_id)
  where credit_card_id is not null;
