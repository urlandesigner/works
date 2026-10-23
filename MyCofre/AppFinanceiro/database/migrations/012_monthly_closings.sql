-- Fechamento mensal (snapshot) + histórico para comparação mês a mês
-- Objetivo: registrar um "retrato" do patrimônio e do resultado do mês no momento do fechamento.

create extension if not exists pgcrypto;

create table if not exists public.monthly_closings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  year int not null,
  month int not null check (month >= 1 and month <= 12),
  closed_at timestamptz not null default now(),

  -- Totais patrimoniais (alinhado ao dashboard)
  total_accounts numeric not null default 0,
  total_investments numeric not null default 0,
  patrimony_total numeric not null default 0,

  -- Resultado do mês (competência, alinhado à home/relatórios)
  month_income numeric not null default 0,
  month_expenses numeric not null default 0,
  month_balance numeric not null default 0,

  notes text
);

create unique index if not exists monthly_closings_user_month_uniq
  on public.monthly_closings (user_id, year, month);

create index if not exists monthly_closings_user_id_idx
  on public.monthly_closings (user_id, year desc, month desc);

create table if not exists public.monthly_closing_accounts (
  id uuid primary key default gen_random_uuid(),
  closing_id uuid not null references public.monthly_closings (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid references public.accounts (id) on delete set null,
  account_name text not null,
  account_type text,
  institution text,
  balance numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists monthly_closing_accounts_closing_id_idx
  on public.monthly_closing_accounts (closing_id);

create index if not exists monthly_closing_accounts_user_id_idx
  on public.monthly_closing_accounts (user_id, created_at desc);

create table if not exists public.monthly_closing_investments (
  id uuid primary key default gen_random_uuid(),
  closing_id uuid not null references public.monthly_closings (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  investment_id uuid references public.investments (id) on delete set null,
  investment_name text not null,
  investment_type text,
  institution text,
  invested_amount numeric not null default 0,
  current_amount numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists monthly_closing_investments_closing_id_idx
  on public.monthly_closing_investments (closing_id);

create index if not exists monthly_closing_investments_user_id_idx
  on public.monthly_closing_investments (user_id, created_at desc);

-- RLS recomendado (descomente se ainda não tiver política equivalente):
-- alter table public.monthly_closings enable row level security;
-- alter table public.monthly_closing_accounts enable row level security;
-- alter table public.monthly_closing_investments enable row level security;
-- create policy "monthly_closings_own_rows"
--   on public.monthly_closings for all
--   using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- create policy "monthly_closing_accounts_own_rows"
--   on public.monthly_closing_accounts for all
--   using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- create policy "monthly_closing_investments_own_rows"
--   on public.monthly_closing_investments for all
--   using (auth.uid() = user_id) with check (auth.uid() = user_id);

