# Dashboard e dados no Supabase

A **Visão geral (Dashboard)** usa apenas contextos que carregam do Supabase para o usuário autenticado (`auth.uid()` / `user_id` nas tabelas):

| Dado | Contexto | Tabela(s) |
|------|----------|-----------|
| Transações | `TransactionsProvider` | `transactions` |
| Contas | `AccountsProvider` | `accounts` |
| Investimentos | `InvestmentsProvider` | `investments` |
| Cartões e faturas | `CreditCardsProvider` | `credit_cards`, `credit_card_bills` |
| Categorias (nome nas listas) | `CategoriesProvider` | `categories` |
| Metas | `GoalsProvider` | `goals` |
| Assinaturas | `SubscriptionsProvider` | `subscriptions` |

Métricas (patrimônio líquido, disponível em contas, investimentos, receitas/despesas do mês, saldo, projeção de metas) são calculadas em `src/lib` a partir desses arrays — não há `localStorage` na página do dashboard.

## Migração SQL

Se ainda não existirem colunas/tabelas, rode no SQL Editor do Supabase:

- `database/migrations/005_dashboard_accounts_investments_credit_cards.sql`
- `database/migrations/007_subscriptions_supabase.sql` (assinaturas)

Habilite RLS conforme seu modelo.

## Preferências ainda locais

- Ocultar valores / sidebar: `localStorage` (não são dados financeiros por usuário no banco).
