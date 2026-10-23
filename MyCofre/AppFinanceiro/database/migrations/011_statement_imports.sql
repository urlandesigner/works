-- Importacao de extratos em area isolada (staging + confirmacao manual)

create table if not exists public.statement_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  file_name text not null,
  bank_name text not null default 'itau',
  file_type text not null default 'pdf',
  raw_text text not null default '',
  parsing_status text not null default 'processing',
  created_at timestamptz not null default now()
);

create index if not exists statement_imports_user_id_idx
  on public.statement_imports (user_id, created_at desc);

create table if not exists public.statement_import_items (
  id uuid primary key default gen_random_uuid(),
  import_id uuid not null references public.statement_imports (id) on delete cascade,
  transaction_date date,
  description text not null default '',
  amount numeric not null default 0,
  type text not null check (type in ('income', 'expense')),
  suggested_category text,
  is_selected boolean not null default true,
  review_status text not null default 'pending',
  duplicate_hint boolean not null default false,
  duplicate_reason text,
  created_at timestamptz not null default now()
);

create index if not exists statement_import_items_import_id_idx
  on public.statement_import_items (import_id, created_at asc);

alter table public.transactions
  add column if not exists source text;

alter table public.transactions
  add column if not exists source_bank text;

alter table public.transactions
  add column if not exists import_batch_id uuid;

create index if not exists transactions_import_batch_id_idx
  on public.transactions (import_batch_id)
  where import_batch_id is not null;

-- RLS recomendado (descomente se ainda nao tiver politica equivalente):
-- alter table public.statement_imports enable row level security;
-- alter table public.statement_import_items enable row level security;
-- create policy "statement_imports_own_rows"
--   on public.statement_imports for all
--   using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- create policy "statement_import_items_own_rows"
--   on public.statement_import_items for all
--   using (
--     exists (
--       select 1 from public.statement_imports si
--       where si.id = statement_import_items.import_id
--         and si.user_id = auth.uid()
--     )
--   )
--   with check (
--     exists (
--       select 1 from public.statement_imports si
--       where si.id = statement_import_items.import_id
--         and si.user_id = auth.uid()
--     )
--   );
