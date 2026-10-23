-- Dashboard / Visão geral: colunas e tabelas usadas pelos repositórios Supabase.
-- Execute no SQL Editor do Supabase conforme o que ainda faltar no seu projeto.

-- Contas: campos extras (patrimônio, vínculo com investimentos, status)
alter table public.accounts
  add column if not exists institution text;

alter table public.accounts
  add column if not exists allows_investments boolean not null default false;

alter table public.accounts
  add column if not exists status text default 'active';

alter table public.accounts
  add column if not exists notes text;

-- Investimentos: conta, tipo, status, metadados
alter table public.investments
  add column if not exists account_id uuid references public.accounts(id) on delete set null;

alter table public.investments
  add column if not exists type text not null default 'fixed_income';

alter table public.investments
  add column if not exists status text default 'active';

alter table public.investments
  add column if not exists notes text;

alter table public.investments
  add column if not exists institution text;

alter table public.investments
  add column if not exists created_at timestamptz default now();

-- Cartões de crédito
create table if not exists public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  brand text not null,
  last_four_digits text not null,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists credit_cards_user_id_idx on public.credit_cards(user_id);

-- Faturas de cartão (competência mês/ano; usadas nas despesas do mês no dashboard)
create table if not exists public.credit_card_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credit_card_id uuid not null references public.credit_cards(id) on delete cascade,
  month int not null check (month >= 1 and month <= 12),
  year int not null,
  amount numeric not null default 0,
  is_paid boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists credit_card_bills_user_id_idx on public.credit_card_bills(user_id);
create index if not exists credit_card_bills_card_idx on public.credit_card_bills(credit_card_id);

-- RLS (exemplo — ajuste políticas ao seu esquema)
-- alter table public.credit_cards enable row level security;
-- create policy "credit_cards_own" on public.credit_cards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- alter table public.credit_card_bills enable row level security;
-- create policy "credit_card_bills_own" on public.credit_card_bills for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
