-- Metas: alinhar tabela existente ao que o app envia/consulta.
-- Execute no SQL Editor do Supabase se sua tabela ainda não tiver todas as colunas.

alter table public.goals
  add column if not exists color text;

alter table public.goals
  add column if not exists is_active boolean not null default true;

alter table public.goals
  add column if not exists created_at timestamptz not null default now();

-- Necessário para “Patrimônio líquido” vs “Valor manual” no app.
alter table public.goals
  add column if not exists goal_type text not null default 'manual';

-- Opcional: validar valores (PostgreSQL 12+)
-- alter table public.goals drop constraint if exists goals_goal_type_check;
-- alter table public.goals add constraint goals_goal_type_check
--   check (goal_type in ('manual', 'net_worth'));

-- Exemplo de RLS (ajuste ao seu modelo de auth):
-- alter table public.goals enable row level security;
-- create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);
-- create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
-- create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id);
-- create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);
