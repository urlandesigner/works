# Deploy do backend

Projeto atual:
- `project ref`: `svhmoubcworhmctiudsz`
- `project url`: `https://svhmoubcworhmctiudsz.supabase.co`

O frontend já está apontando para esse projeto via `.env.local`.

## Caminho A — via CLI autenticado

### 1. Schema, RLS e RPC
```bash
npx supabase login
npx supabase link --project-ref svhmoubcworhmctiudsz
npx supabase db push
```

Isso cria:
- 5 tabelas
- trigger de `sync_state`
- 5 funções RPC
- policies de RLS

### 2. Secrets da Edge Function
```bash
npx supabase secrets set GA4_SERVICE_ACCOUNT_JSON='{"client_email":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"}'
```

### 3. Edge Function
```bash
npx supabase functions deploy sync-ga4
```

### 4. Cron (opcional agora, recomendado depois)
Usar o SQL em [`supabase/sql/cron_sync_ga4.sql`](/Users/urlandipre/Documents/Projeto pessoal/Analytics/supabase/sql/cron_sync_ga4.sql) depois de substituir `<SERVICE_ROLE_JWT>`.

## Caminho B — manual no dashboard (sem CLI autenticado)

### 1. SQL Editor
No Supabase Dashboard:
- abra `SQL Editor`
- cole o conteúdo de [`supabase/migrations/0001_initial_schema.sql`](/Users/urlandipre/Documents/Projeto pessoal/Analytics/supabase/migrations/0001_initial_schema.sql)
- execute

Isso já coloca o banco no formato esperado pelo app.

### 2. Usuário único
No Dashboard:
- `Authentication` → `Users`
- `Create user`
- informe email e senha
- marque o email como confirmado se necessário

Observação:
- o app não precisa de signup público
- o ideal é manter apenas esse usuário administrador

### 3. Edge Function `sync-ga4`
No Dashboard:
- `Edge Functions`
- crie/deploy a função `sync-ga4`
- use como base os arquivos:
  - preferencialmente cole o arquivo único:
    - [`supabase/functions/sync-ga4/dashboard.ts`](/Users/urlandipre/Documents/Projeto pessoal/Analytics/supabase/functions/sync-ga4/dashboard.ts)
  - alternativa local/CLI:
    - [`supabase/functions/sync-ga4/index.ts`](/Users/urlandipre/Documents/Projeto pessoal/Analytics/supabase/functions/sync-ga4/index.ts)
    - [`supabase/functions/sync-ga4/ga4.ts`](/Users/urlandipre/Documents/Projeto pessoal/Analytics/supabase/functions/sync-ga4/ga4.ts)

### 4. Secret da service account do GA4
Ainda no Supabase:
- `Settings` → `Edge Functions` ou `Project Settings` → `Secrets`
- crie `GA4_SERVICE_ACCOUNT_JSON`
- valor:
  - o JSON completo da service account
  - com a `private_key` preservando quebras de linha

Depois, no Google Analytics:
- adicione o `client_email` da service account como `Viewer` em cada propriedade GA4 usada

### 5. Cron diário
Se quiser ativar o sync recorrente agora:
- habilite `pg_cron` e `pg_net`
- abra `SQL Editor`
- use o arquivo [`supabase/sql/cron_sync_ga4.sql`](/Users/urlandipre/Documents/Projeto pessoal/Analytics/supabase/sql/cron_sync_ga4.sql)
- antes de executar, substitua `<SERVICE_ROLE_JWT>` pela chave `service_role` da aba `Legacy API Keys`

Observação importante:
- o cron do Supabase roda em UTC
- no SQL atual, `0 6 * * *` significa `06:00 UTC`, que em `America/Sao_Paulo` equivale a `03:00`
- se você preferir rodar às `06:00` no horário de São Paulo, altere a expressão para `0 9 * * *`

Depois de executar:
- valide em `cron.job` se o job `sync-ga4-diario` foi criado
- valide em `cron.job_run_details` se as execuções estão acontecendo

Alternativa via Dashboard:
- vá em `Cron` ou `Jobs`
- crie um job chamado `sync-ga4-diario`
- use a expressão desejada
- cole o SQL de chamada HTTP do mesmo arquivo

## Checklist mínimo para o app sair do mock de verdade

1. Migration executada no banco
2. Um usuário criado em `Authentication`
3. Login funcionando no app

## Checklist para puxar GA4 real

1. Edge Function `sync-ga4` deployada
2. Secret `GA4_SERVICE_ACCOUNT_JSON` configurado
3. Service account adicionada às propriedades GA4
4. Primeiro cadastro de site com `GA4 Property ID` válido
5. Cron diário ativado se quiser sync recorrente automático

## Como validar

1. Abra o app
2. Faça login com o usuário criado no Supabase
3. Cadastre um site
4. Confirme no banco que existem linhas em:
   - `site`
   - `sync_state`
5. Depois do primeiro sync real, confirme dados em:
   - `metrica`
   - `pagina_metrica`
   - `canal_metrica`
6. Depois de ativar o cron, confirme histórico em:
   - `cron.job`
   - `cron.job_run_details`
