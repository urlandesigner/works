// Tipos de domínio (camelCase). As linhas cruas do banco ficam em ./db.

export type SiteStatus = 'ativo' | 'pausado' | 'arquivado';
export type SyncStatus = 'ok' | 'running' | 'error' | 'no_data';
export type AttentionReason = 'technical' | 'drop' | 'spike' | null;
export type Direction = 'up' | 'down' | 'flat' | 'new';

export interface Site {
  id: string;
  nome: string;
  url: string;
  ga4PropertyId: string;
  cliente: string | null;
  segmento: string | null;
  status: SiteStatus;
  createdAt: string;
}

export interface SiteInput {
  nome: string;
  url: string;
  ga4PropertyId: string;
  cliente?: string | null;
  segmento?: string | null;
  status?: SiteStatus;
}

export interface SyncState {
  siteId: string;
  lastSyncAt: string | null;
  status: SyncStatus;
  errorMessage: string | null;
}

// Variação 7v7. pct === null => "novo" (período anterior era zero).
export interface Variation {
  pct: number | null;
  direction: Direction;
}

export interface MetricPair {
  atual: number;
  anterior: number;
  variation: Variation;
}

// Home: payload leve, orientado a SINAL (contrato Home != Site).
export interface SiteSignal {
  siteId: string;
  nome: string;
  cliente: string | null;
  status: SiteStatus;
  syncStatus: SyncStatus | null;
  lastSyncAt: string | null;
  usuarios: MetricPair;
  conversoes: MetricPair;
  attentionReason: AttentionReason;
}

// Dashboard do Site: payload pesado, orientado a SUBSTÂNCIA.
export interface SiteCards {
  usuarios: MetricPair;
  sessoes: MetricPair;
  pageviews: MetricPair;
  conversoes: MetricPair;
}

export interface TrendPoint {
  dia: string;
  atual: number;
  anterior: number;
}

export interface ChannelRow {
  canal: string;
  usuarios: number;
  sessoes: number;
  conversoes: number;
  varUsuarios: Variation;
}

export interface PageRow {
  pagePath: string;
  pageTitle: string | null;
  pageviews: number;
  varPageviews: Variation;
  pctTotal: number | null;
}

export interface SiteDetail {
  cards: SiteCards;
  trend: TrendPoint[];
  channels: ChannelRow[];
  pages: PageRow[];
}

// Tendência agregada do portfólio (Home) — total de usuários por dia.
export interface PortfolioTrendPoint {
  dia: string;
  usuarios: number;
}
