-- Assinaturas: tabela esperada por src/lib/supabase/subscriptionsRepo.ts
-- Execute no SQL Editor do Supabase.

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  monthly_amount numeric not null default 0,
  periodicity text not null default 'monthly',
  payment_method text,
  billing_day int not null check (billing_day >= 1 and billing_day <= 31),
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

-- Opcional: restringir valores
-- alter table public.subscriptions drop constraint if exists subscriptions_periodicity_check;
-- alter table public.subscriptions add constraint subscriptions_periodicity_check
--   check (periodicity in ('monthly', 'annual'));
-- alter table public.subscriptions drop constraint if exists subscriptions_status_check;
-- alter table public.subscriptions add constraint subscriptions_status_check
--   check (status in ('active', 'inactive'));

-- RLS (exemplo)
-- alter table public.subscriptions enable row level security;
-- create policy "subscriptions_own" on public.subscriptions
--   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
