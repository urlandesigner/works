# Transações no Supabase

## O que o app faz

- Lista, cria, atualiza e exclui registros na tabela **`transactions`**.
- Todas as queries usam **`user_id` = `auth.uid()`** do usuário logado (via `useAuth()`).
- O `localStorage` **não é mais usado** para transações no fluxo normal do app.

## Banco de dados

1. Colunas usadas pelo cliente:
   - `id`, `user_id`, `account_id`, `category_id`, `type`, `description`, `amount`, `transaction_date`
   - `notes`, `recurrence` (recomendado — ver migração em `database/migrations/003_transactions_notes_recurrence.sql`)

2. **`user_id`** deve ser o mesmo UUID do usuário no **Supabase Auth**. Se a FK apontar para `public.users` em vez de `auth.users`, ajuste no SQL ou mantenha IDs alinhados ao login.

3. **`category_id` e `account_id`**: o app ainda usa IDs de categorias mock (`cat1`, …) e contas locais (ex.: prefixo `ac-`). Se no Postgres essas colunas forem **`uuid`** com FK, os inserts podem falhar até você:
   - migrar categorias/contas para o Supabase com UUIDs válidos, **ou**
   - alterar as colunas para **`text`** (sem FK), se fizer sentido na sua modelagem.

## RLS

Configure políticas para que cada usuário só acesse linhas com `user_id = auth.uid()`. Exemplos comentados estão na migração `003_transactions_notes_recurrence.sql`.

## Importação JSON (Configurações)

A importação ainda pode gravar `appfinanceiro.transactions` no **localStorage**; o módulo de transações **não lê** mais essa chave. Para restaurar backup antigo, será preciso um script ou fluxo dedicado no futuro.
