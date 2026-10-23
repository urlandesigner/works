// Linhas cruas (snake_case) retornadas pelo Supabase / RPC.
// Mapeadas para o domínio (camelCase) na camada de serviços.

export interface SiteRow {
  id: string;
  nome: string;
  url: string;
  ga4_property_id: string;
  cliente: string | null;
  segmento: string | null;
  status: string;
  created_at: string;
}

export interface SiteInsert {
  nome: string;
  url: string;
  ga4_property_id: string;
  cliente: string | null;
  segmento: string | null;
  status: string;
}

export interface SyncStateRow {
  site_id: string;
  last_sync_at: string | null;
  status: string;
  error_message: string | null;
}

export interface OverviewRow {
  site_id: string;
  nome: string;
  cliente: string | null;
  status: string;
  sync_status: string | null;
  last_sync_at: string | null;
  usuarios_atual: number;
  usuarios_anterior: number;
  conversoes_atual: number;
  conversoes_anterior: number;
  var_usuarios: number | null;
  var_conversoes: number | null;
  attention_reason: string | null;
}

export interface CardsRow {
  usuarios_atual: number;
  usuarios_anterior: number;
  var_usuarios: number | null;
  sessoes_atual: number;
  sessoes_anterior: number;
  var_sessoes: number | null;
  pageviews_atual: number;
  pageviews_anterior: number;
  var_pageviews: number | null;
  conversoes_atual: number;
  conversoes_anterior: number;
  var_conversoes: number | null;
}

export interface TrendRow {
  dia: string;
  usuarios_atual: number;
  usuarios_anterior: number;
}

export interface ChannelMetricRow {
  canal: string;
  usuarios: number;
  sessoes: number;
  conversoes: number;
  var_usuarios: number | null;
}

export interface PageMetricRow {
  page_path: string;
  page_title: string | null;
  pageviews: number;
  var_pageviews: number | null;
  pct_total: number | null;
}
