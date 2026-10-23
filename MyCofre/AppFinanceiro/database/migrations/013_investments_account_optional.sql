-- Tornar account_id opcional em investimentos (permite NULL).
-- Mantém dados existentes e evita quebra em integrações.

alter table public.investments
  alter column account_id drop not null;

-- Garantir comportamento ao deletar conta: manter investimento e setar NULL.
alter table public.investments
  drop constraint if exists investments_account_id_fkey;

alter table public.investments
  add constraint investments_account_id_fkey
  foreign key (account_id)
  references public.accounts (id)
  on delete set null;

