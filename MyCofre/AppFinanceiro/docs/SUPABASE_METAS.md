# Metas no Supabase

## Comportamento do app

- CRUD na tabela **`goals`**, sempre com **`user_id` = usuário logado** (`auth.uid()`).
- O **`localStorage` não é mais usado** para metas no fluxo normal.
- **Projeção de metas** (Home e card embutido em Metas) continua usando o array `goals` do contexto e `getGoalCurrentAmount` — sem mudança de lógica.

## Mapper frontend ↔ banco

| App (`Goal`)     | Coluna SQL        | Observação                          |
|------------------|-------------------|-------------------------------------|
| `id`             | `id`              | UUID gerado pelo banco              |
| `user_id`        | `user_id`         | UUID do Auth                        |
| `name`           | `name`            |                                     |
| `target_amount`  | `target_amount`   | numeric                             |
| `current_amount` | `current_amount`  | numeric                             |
| `goal_type`      | `goal_type`       | `manual` \| `net_worth` (migração)  |
| `color`          | `color`           | opcional; UI ainda não usa          |
| `is_active`      | `is_active`       | padrão `true`                       |
| `created_at`     | `created_at`      | só leitura; ordenação da lista      |

Código: `src/lib/supabase/goalsRepo.ts` (`mapRowToGoal`, `goalToInsertRow`).

## Migração

Se a tabela já existir sem `goal_type`, `color`, `is_active` ou `created_at`, rode:

`database/migrations/004_goals_supabase_columns.sql`

Sem **`goal_type`**, o insert/update do app pode falhar; sem as outras colunas, o PostgREST também pode reclamar conforme o schema real.

## Importação JSON

A chave `appfinanceiro.goals` no backup ainda pode ser gravada pelo import em Configurações, mas o módulo de metas **não lê** mais essa chave.
