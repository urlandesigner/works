-- Mensageiro do Bem — schema dedicado (isolado de `public` e de outros apps no mesmo projeto)
-- Rode no SQL Editor do Supabase ou via: supabase db push

CREATE SCHEMA IF NOT EXISTS mensageiro;

-- Pagamentos registrados para conciliação e webhooks (Mercado Pago / Asaas)
CREATE TABLE mensageiro.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificador do gateway (estável para webhooks e queries)
  gateway text NOT NULL CHECK (gateway IN ('mercado_pago', 'asaas')),

  -- ID retornado pelo gateway (ex.: payment id MP / Asaas)
  external_payment_id text NOT NULL,

  -- Valor em reais (ex.: 1.00)
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),

  -- pending | approved | failed | refunded | ... (extensível sem migração imediata)
  status text NOT NULL DEFAULT 'pending',

  confirmed_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT mensageiro_payments_gateway_external_unique UNIQUE (gateway, external_payment_id)
);

CREATE INDEX idx_mensageiro_payments_status_created
  ON mensageiro.payments (status, created_at DESC);

CREATE INDEX idx_mensageiro_payments_gateway_external
  ON mensageiro.payments (gateway, external_payment_id);

COMMENT ON SCHEMA mensageiro IS 'Dados exclusivos do app Mensageiro do Bem.';
COMMENT ON TABLE mensageiro.payments IS 'Histórico de cobranças; usar com service role no servidor ou políticas RLS dedicadas.';

-- Ajuste de permissões (Supabase: service_role bypassa RLS; ideal para escrita via API routes)
GRANT USAGE ON SCHEMA mensageiro TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA mensageiro TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA mensageiro TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA mensageiro
  GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA mensageiro
  GRANT ALL ON SEQUENCES TO postgres, service_role;

-- Opcional: endurecer — não conceder nada a anon/authenticated até precisar de leitura no cliente
REVOKE ALL ON SCHEMA mensageiro FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA mensageiro FROM PUBLIC;
