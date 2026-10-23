-- Agenda o sync incremental diário da Edge Function `sync-ga4`.
--
-- Pré-requisitos:
-- 1. A função `sync-ga4` já está deployada
-- 2. As extensões `pg_cron` e `pg_net` estão habilitadas
-- 3. Substitua <SERVICE_ROLE_JWT> pela chave `service_role` da aba "Legacy API Keys"
--    em `Settings -> API Keys` no Supabase
--
-- Observações:
-- - O cron do Supabase roda em UTC por padrão.
-- - `0 6 * * *` = 06:00 UTC = 03:00 em America/Sao_Paulo.
-- - Se você quiser rodar às 06:00 de Sao Paulo, troque para `0 9 * * *`.

select cron.schedule(
  'sync-ga4-diario',
  '0 6 * * *',
  $$
  select net.http_post(
    url     := 'https://svhmoubcworhmctiudsz.supabase.co/functions/v1/sync-ga4',
    headers := jsonb_build_object(
      'Content-Type',
      'application/json',
      'Authorization',
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aG1vdWJjd29yaG1jdGl1ZHN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ5ODc2OCwiZXhwIjoyMDk3MDc0NzY4fQ.nn7ujZiPHxvdDCbermsCaOEsrZTKWyShyzjSG8MrYWE'
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 10000
  );
  $$
);

-- Validação rápida:
-- select jobid, jobname, schedule, active from cron.job order by jobid desc;
-- select jobid, status, start_time, end_time
-- from cron.job_run_details
-- order by start_time desc
-- limit 20;
