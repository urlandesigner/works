-- =============================================================================
-- Schema consolidado esperado pelo frontend (repos em src/lib/supabase/*)
-- Rode no SQL Editor do Supabase. Idempotente na medida do possível (IF NOT EXISTS / IF NOT EXISTS coluna).
-- Ajuste RLS ao final conforme seu projeto.
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- ACCOUNTS
-- ---------------------------------------------------------------------------
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null,
  initial_balance numeric not null default 0,
  created_at timestamptz not null default now(),
  institution text,
  allows_investments boolean not null default false,
  status text not null default 'active',
  notes text
);

create index if not exists accounts_user_id_idx on public.accounts (user_id);

alter table public.accounts add column if not exists institution text;
alter table public.accounts add column if not exists allows_investments boolean;
update public.accounts set allows_investments = coalesce(allows_investments, false) where allows_investments is null;
alter table public.accounts alter column allows_investments set default false;
alter table public.accounts alter column allows_investments set not null;

alter table public.accounts add column if not exists status text;
update public.accounts set status = coalesce(status, 'active') where status is null;
alter table public.accounts alter column status set default 'active';

alter table public.accounts add column if not exists notes text;
alter table public.accounts add column if not exists created_at timestamptz;
update public.accounts set created_at = coalesce(created_at, now()) where created_at is null;
alter table public.accounts alter column created_at set default now();

alter table public.accounts add column if not exists include_in_net_worth boolean;
update public.accounts set include_in_net_worth = coalesce(include_in_net_worth, true) where include_in_net_worth is null;
alter table public.accounts alter column include_in_net_worth set default true;
alter table public.accounts alter column include_in_net_worth set not null;

-- ---------------------------------------------------------------------------
-- CATEGORIES — id TEXT + PK composta (user_id, id) para compatibilidade com
-- mock cat1…cat6 nos formulários de transação (sem alterar o frontend).
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  primary key (user_id, id)
);

create index if not exists categories_user_id_idx on public.categories (user_id);

-- ---------------------------------------------------------------------------
-- TRANSACTIONS — coluna de data: "date" (não transaction_date)
-- ---------------------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid references public.accounts (id) on delete set null,
  category_id text not null,
  type text not null check (type in ('income', 'expense')),
  description text,
  amount numeric not null,
  date date not null,
  notes text,
  recurrence text not null default 'none'
);

alter table public.transactions add column if not exists notes text;
alter table public.transactions add column if not exists recurrence text;
update public.transactions set recurrence = coalesce(recurrence, 'none') where recurrence is null;
alter table public.transactions alter column recurrence set default 'none';

-- Se a tabela já existia com transaction_date em vez de date:
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'transaction_date'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'date'
  ) then
    alter table public.transactions rename column transaction_date to date;
  end if;
end $$;

-- FK composta: categoria pertence ao mesmo usuário
alter table public.transactions
  drop constraint if exists transactions_user_category_fkey;

alter table public.transactions
  add constraint transactions_user_category_fkey
  foreign key (user_id, category_id)
  references public.categories (user_id, id)
  on delete restrict;

create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_date_idx on public.transactions (date desc);

-- ---------------------------------------------------------------------------
-- INVESTMENTS
-- ---------------------------------------------------------------------------
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete restrict,
  name text not null,
  type text not null default 'fixed_income',
  invested_amount numeric not null default 0,
  current_amount numeric not null default 0,
  institution text,
  notes text,
  status text default 'active',
  created_at timestamptz not null default now()
);

alter table public.investments add column if not exists account_id uuid references public.accounts (id) on delete set null;
alter table public.investments add column if not exists type text;
update public.investments set type = coalesce(type, 'fixed_income') where type is null;
alter table public.investments alter column type set default 'fixed_income';

alter table public.investments add column if not exists institution text;
alter table public.investments add column if not exists notes text;
alter table public.investments add column if not exists status text;
alter table public.investments add column if not exists created_at timestamptz;
update public.investments set created_at = coalesce(created_at, now()) where created_at is null;
alter table public.investments alter column created_at set default now();

create index if not exists investments_user_id_idx on public.investments (user_id);

-- ---------------------------------------------------------------------------
-- GOALS
-- ---------------------------------------------------------------------------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric not null default 0,
  current_amount numeric not null default 0,
  color text,
  is_active boolean not null default true,
  goal_type text not null default 'manual',
  created_at timestamptz not null default now()
);

alter table public.goals add column if not exists color text;
alter table public.goals add column if not exists is_active boolean;
update public.goals set is_active = coalesce(is_active, true) where is_active is null;
alter table public.goals alter column is_active set default true;

alter table public.goals add column if not exists goal_type text;
update public.goals set goal_type = coalesce(goal_type, 'manual') where goal_type is null;
alter table public.goals alter column goal_type set default 'manual';

alter table public.goals add column if not exists created_at timestamptz;
update public.goals set created_at = coalesce(created_at, now()) where created_at is null;

create index if not exists goals_user_id_idx on public.goals (user_id);

-- ---------------------------------------------------------------------------
-- CREDIT CARDS + BILLS (user_id obrigatório em credit_card_bills no app)
-- ---------------------------------------------------------------------------
create table if not exists public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  brand text not null,
  last_four_digits text not null,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists credit_cards_user_id_idx on public.credit_cards (user_id);

create table if not exists public.credit_card_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  credit_card_id uuid not null references public.credit_cards (id) on delete cascade,
  month int not null check (month >= 1 and month <= 12),
  year int not null,
  amount numeric not null default 0,
  is_paid boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.credit_card_bills add column if not exists user_id uuid references auth.users (id) on delete cascade;
-- Preencher user_id a partir do cartão se estiver nulo (dados legados)
update public.credit_card_bills b
set user_id = c.user_id
from public.credit_cards c
where b.credit_card_id = c.id and b.user_id is null;

create index if not exists credit_card_bills_user_id_idx on public.credit_card_bills (user_id);

-- ---------------------------------------------------------------------------
-- Seed opcional de categorias (mesmos ids do mock) — substitua :uid pelo UUID do auth.users
-- ---------------------------------------------------------------------------
-- insert into public.categories (user_id, id, name, type) values
--   ('00000000-0000-0000-0000-000000000000', 'cat1', 'Salário', 'income'),
--   ('00000000-0000-0000-0000-000000000000', 'cat2', 'Freelance', 'income'),
--   ('00000000-0000-0000-0000-000000000000', 'cat3', 'Alimentação', 'expense'),
--   ('00000000-0000-0000-0000-000000000000', 'cat4', 'Transporte', 'expense'),
--   ('00000000-0000-0000-0000-000000000000', 'cat5', 'Moradia', 'expense'),
--   ('00000000-0000-0000-0000-000000000000', 'cat6', 'Lazer', 'expense')
-- on conflict (user_id, id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS (exemplo — descomente e alinhe às suas políticas)
-- ---------------------------------------------------------------------------
-- alter table public.accounts enable row level security;
-- alter table public.categories enable row level security;
-- alter table public.transactions enable row level security;
-- alter table public.investments enable row level security;
-- alter table public.goals enable row level security;
-- alter table public.credit_cards enable row level security;
-- alter table public.credit_card_bills enable row level security;
--
-- create policy "own_rows" on public.accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- (repita padrão similar para cada tabela com user_id)
