-- Execute no SQL Editor do Supabase se a tabela já existir sem estas colunas.
-- O app envia `notes` e `recurrence` nas operações de insert/update.

alter table public.transactions
  add column if not exists notes text;

alter table public.transactions
  add column if not exists recurrence text default 'none';

-- Opcional: alinhar user_id ao auth.users (ajuste se você usa outro modelo).
-- alter table public.transactions drop constraint if exists transactions_user_id_fkey;
-- alter table public.transactions
--   add constraint transactions_user_id_fkey
--   foreign key (user_id) references auth.users (id) on delete cascade;

-- Exemplo de RLS (habilite RLS na tabela e crie políticas equivalentes):
-- alter table public.transactions enable row level security;
--
-- create policy "transactions_select_own"
--   on public.transactions for select
--   using (auth.uid() = user_id);
--
-- create policy "transactions_insert_own"
--   on public.transactions for insert
--   with check (auth.uid() = user_id);
--
-- create policy "transactions_update_own"
--   on public.transactions for update
--   using (auth.uid() = user_id);
--
-- create policy "transactions_delete_own"
--   on public.transactions for delete
--   using (auth.uid() = user_id);
