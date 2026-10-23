# Arquitetura Técnica do MVP

Documento de referência. Escopo congelado (ver `product-requirements.md`). Ferramenta interna, single-user, fonte única GA4.

> Stack é **React SPA + Supabase** — NÃO é Next.js. Sem App Router, sem Cache Components/`use cache`.

## 1. Estrutura do projeto

```
analytics-dashboard/
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx                  # providers + router
│  ├─ routes/                  # uma por rota do sitemap
│  │  ├─ login.tsx
│  │  ├─ overview.tsx          # Home (central operacional)
│  │  ├─ sites.tsx
│  │  ├─ site-new.tsx
│  │  ├─ site-detail.tsx
│  │  ├─ site-edit.tsx
│  │  └─ settings.tsx
│  ├─ features/                # lógica por domínio de tela
│  │  ├─ overview/             # AttentionCounters, AttentionList, SiteSignalRow, StableList
│  │  ├─ sites/                # cadastro, edição, lista, validação e ações operacionais
│  │  ├─ site-detail/          # MetricCard, TrendChart, ChannelTable, PagesTable
│  │  └─ settings/             # painel operacional de integrações e sessão
│  ├─ components/
│  │  ├─ ui/                   # Button, FormField, Card, SyncBadge, DeltaPill
│  │  ├─ layout/               # AppShell, Sidebar, Topbar, PeriodSelector
│  │  └─ states/               # EmptyState, LoadingState, ErrorState
│  ├─ integrations/            # cliente Supabase
│  ├─ repositories/            # acesso bruto a Supabase / RPC / functions
│  ├─ services/                # transformação e orquestração de domínio
│  ├─ hooks/                   # React Query hooks + useAuth
│  ├─ lib/                     # period (7v7), variation, attention, format
│  ├─ mocks/                   # modo local/offline para desenvolvimento
│  ├─ providers/               # AuthProvider, QueryProvider
│  ├─ types/                   # tipos de domínio
│  └─ styles/
├─ supabase/
│  ├─ migrations/              # tabelas, views, RPC, RLS
│  ├─ sql/                     # jobs auxiliares como cron
│  └─ functions/
│     └─ sync-ga4/
│        ├─ index.ts           # versão local/CLI
│        └─ dashboard.ts       # versão arquivo único para colar no Dashboard
├─ .env.local
├─ vite.config.ts · tailwind.config.ts · tsconfig.json
```

Princípio: `routes/` orquestra · `features/` resolve um domínio · `components/` é reutilizável · `hooks/` consome `services/` · `services/` usam `repositories/`. JSX nunca chama o Supabase direto.

## 2. Stack definitiva

| Camada | Escolha | Porquê |
|---|---|---|
| Build/Dev | Vite + React 18 + TypeScript | SPA interna, sem SSR/SEO. Mais simples que Next.js. |
| Estilo | Tailwind CSS | Densidade/escaneabilidade do design system. |
| Roteamento | React Router v6 | Roteamento client-side do sitemap. |
| Estado de servidor | TanStack Query (React Query) | Cache, revalidação, loading/erro prontos. |
| Gráficos | Recharts (linha) + Sparkline SVG próprio | Um chart no Site; sparkline leve na Home. |
| Backend/Dados | Supabase — Postgres, Auth, Edge Functions, pg_cron | Banco + auth + cron + função num só lugar. |
| Fonte externa | GA4 Data API v1 (server-side, na Edge Function) | Única fonte; nunca chamada do browser. |

## 3. Arquitetura do frontend

- SPA em camadas: integration → repository → service → hook → feature → ui.
- Dados via React Query: hook → service → repository. Loading/empty/error vindos do estado da query.
- A lente temporal do MVP é fixa: últimos 7 dias vs 7 anteriores. Hoje isso aparece como chip informativo em `PeriodSelector`.
- Auth guard: `<ProtectedRoute>` envolve tudo exceto `/login`.
- Cálculo de sinal/atenção no servidor (RPC Postgres); o front só renderiza.

## 4. Estrutura do Supabase

- Postgres — tabelas + views/RPC de agregação.
- Auth — usuário único (e-mail/senha).
- Edge Functions — `sync-ga4` (Deno); guarda credenciais GA4.
- pg_cron — agenda a sincronização diária.
- RLS ligada em todas as tabelas; política: somente autenticado (sem multi-tenant).

## 5. Tabelas

```
site
- id uuid pk · nome text not null · url text not null · ga4_property_id text not null
- cliente text null · segmento text null · status text null · created_at timestamptz default now()

metrica                              # total diário por site
- id uuid pk · site_id uuid fk→site on delete cascade · data date not null
- usuarios int · sessoes int · pageviews int · conversoes int
- unique (site_id, data)

pagina_metrica                       # dimensão página
- id uuid pk · site_id uuid fk→site on delete cascade · data date not null
- page_path text not null · page_title text null · pageviews int
- unique (site_id, data, page_path)

canal_metrica                        # dimensão canal/origem
- id uuid pk · site_id uuid fk→site on delete cascade · data date not null
- canal text not null                # sessionDefaultChannelGroup
- usuarios int · sessoes int · conversoes int
- unique (site_id, data, canal)

sync_state                           # frescor + status por site
- site_id uuid pk fk→site on delete cascade
- last_sync_at timestamptz null · status text · error_message text null
  # status: ok | running | error | no_data
```

Agregação como RPC (não tabela):
- `get_portfolio_overview(p_days)` → por site: usuários/conversões atual vs anterior, variação %, `attention_reason`. Home = 1 query.
- `get_site_cards(p_site_id, p_days)` → cards 7v7 do dashboard do site.
- `get_site_trend(p_site_id, p_days)` → série diária atual vs anterior.
- `get_site_channels(p_site_id, p_days)` → tabela de canais.
- `get_site_pages(p_site_id, p_days, p_limit)` → principais páginas.

## 6. Relacionamentos

```
site (1) ──< (N) metrica
site (1) ──< (N) pagina_metrica
site (1) ──< (N) canal_metrica
site (1) ──  (1) sync_state
```
Todos `on delete cascade`. `unique (site_id, data, …)` garante upsert idempotente. Arquivar = mudar `status`.

## 7. Fluxo de autenticação

```
/login → Supabase Auth (email+senha) → sessão (JWT)
      → <ProtectedRoute> valida sessão → app
      → "Sair" em /configuracoes → signOut → /login
```
- Usuário único provisionado manualmente (sem signup/convite).
- Sem recuperação de senha na UI (reset pelo painel Supabase).
- RLS exige `authenticated`; sem filtro por dono (1 usuário).

## 8. Fluxo de sincronização com GA4

A Edge Function `sync-ga4` aceita body opcional `{ site_id?, days? }`:
- **Cadastro de site** → invocada com `{ site_id }` → primeiro sync (backfill 30 dias).
- **pg_cron diário** → invocada sem body → todos os sites, janela incremental (3 dias).
- **Retry manual por site** → disponível na edição do site e em Configurações.
- `days` ausente → decide por site: nunca sincronizado (`last_sync_at` null) = 30; senão = 3.

```
trigger (cadastro) ─┐
pg_cron (diário) ───┴→ Edge Function sync-ga4
   para cada site (filtrado por site_id se informado):
     days = body.days ?? (last_sync_at ? 3 : 30)
     sync_state.status = 'running'
     GA4 Data API runReport (service account JWT) × 3:
        totais diários → upsert metrica
        por pagePath   → upsert pagina_metrica
        por canal      → upsert canal_metrica
     sync_state = { last_sync_at: now, status: ok | no_data }
   em falha (auth/quota/property): status=error + error_message
```
- Autenticação GA4 = service account (JSON como secret da Edge Function). E-mail da service account adicionado como Viewer em cada GA4 Property.
- O browser nunca toca a GA4 API — só lê do Postgres. O cadastro dispara via `supabase.functions.invoke`.

## 9. Estratégia de atualização dos dados

- Primeiro sync (no cadastro): backfill de 30 dias → garante baseline para 7v7, tendência, ranking e atenção.
- Cadência recorrente: cron diário (ex.: 06:00), janela incremental de 3 dias (corrige dados tardios do GA4).
- Cada execução dá upsert (idempotente) — backfill e incremental nunca duplicam.
- Idempotência: upsert pelas chaves `unique`.
- Frescor: `sync_state.last_sync_at` alimenta os badges "atualizado há X".
- Atenção técnica (critério #1 da Home) deriva de `sync_state`: error → "erro de integração"; sem linhas no período → no_data; `last_sync_at` além de 24h → "sem sync".
- Variação 7v7 na RPC; período anterior = 0 → marca "novo" (sem %).
- Retry manual por site existe para suporte operacional; a rotina principal continua sendo automática.

## 10. Estrutura de componentes

```
ui/          Button, FormField, Card, SyncBadge, DeltaPill
layout/      AppShell, Sidebar, Topbar, PeriodSelector
states/      EmptyState, LoadingState, ErrorState      # genéricos, reutilizados
overview/    AttentionCounters, AttentionList, SiteSignalRow, StableList
sites/       SitesPage, SiteCreateForm, SiteEditPage
site-detail/ MetricCard, TrendChart, ChannelTable, PagesTable, SyncBadge
settings/    SettingsPage
```
DeltaPill e Sparkline são um componente cada (usados em Home e Site). Empty/Loading/Error são 3 genéricos parametrizados.

## 11. Estrutura de páginas

| Rota | Arquivo | Composição |
|---|---|---|
| /login | routes/login.tsx | fora do AppShell |
| / | routes/overview.tsx | AppShell + features/overview |
| /sites | routes/sites.tsx | AppShell + features/sites |
| /sites/new | routes/site-new.tsx | AppShell + cadastro de site |
| /sites/:id | routes/site-detail.tsx | AppShell + features/site-detail |
| /sites/:id/edit | routes/site-edit.tsx | AppShell + edição + retry operacional |
| /configuracoes | routes/settings.tsx | AppShell + painel operacional |

## 12. Estrutura de serviços

```
integrations/
  supabase/client.ts     # cliente único

repositories/
  overview.repository.ts
  site-detail.repository.ts
  sites.repository.ts
  sync.repository.ts

services/
  overview.service.ts
  site-detail.service.ts
  sites.service.ts
  sync.service.ts
```
GA4 não tem service no front — vive só em `supabase/functions/sync-ga4`. `lib/`: period.ts, variation.ts, attention.ts, format.ts.

## 13. Estrutura de tipos/interfaces

```
types/
  Site · DailyMetric · PageMetric · ChannelMetric · SyncState
  Period           # { current: DateRange; previous: DateRange }
  Variation        # { pct: number | null; direction: 'up'|'down'|'flat'|'new' }
  AttentionReason  # 'technical' | 'drop' | 'spike' | null
  SiteSignal       # Home: site + usuarios/conversoes 7v7 + variation + reason + syncState
  SiteDetail       # Site: cards + trend series + channels[] + pages[]
```
`SiteSignal` (Home) e `SiteDetail` (Site) são tipos distintos — materializam o contrato "sinal × substância".

## 14. Estratégia de cache

- Fonte de verdade = Postgres (já é o cache do GA4; RPC faz a agregação).
- React Query no browser: dado muda pouco ao longo do dia, mas o app invalida queries importantes após create/update/archive/retry.
- Query keys por escopo: `['overview']`, `['overview-trend']`, `['sites']`, `['site-detail', id]`, `['site-sync', id]`, `['sync-states']`.
- Invalidação: após criar/editar/arquivar site → invalidate `['sites']` e `['overview']`.
- Sem Service Worker, sem cache de CDN, sem `use cache` (não é Next.js).

## Decisões a confirmar

1. Vite SPA (não Next.js).
2. Service account no GA4 (não OAuth por usuário).
3. Agregação em RPC Postgres (Home e Site).
4. `sync_state` como tabela de saúde.
5. Re-busca dos últimos 3 dias a cada sync.
