import type {
  AttentionReason,
  ChannelRow,
  MetricPair,
  PageRow,
  PortfolioTrendPoint,
  Site,
  SiteDetail,
  SiteInput,
  SiteSignal,
  SyncState,
  TrendPoint,
} from '@/types';
import { attentionRank } from '@/lib/attention';
import { readLocalStorageJSON, writeLocalStorageJSON, emitMockDataChanged } from '@/lib/local-storage';
import { toVariation } from '@/lib/variation';

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const SITES_STORAGE_KEY = 'udlabs.analytics.mock.sites.v1';
const SYNC_STORAGE_KEY = 'udlabs.analytics.mock.sync.v1';
const ANALYTICS_STORAGE_KEY = 'udlabs.analytics.mock.analytics.v1';
const TREND_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;
const CHANNELS = ['Orgânico', 'Direto', 'Pago', 'Social'] as const;

const INITIAL_SITES: Site[] = [
  {
    id: 's1',
    nome: 'Loja Cliente A',
    url: 'https://loja.cliente-a.com',
    ga4PropertyId: '100200300',
    cliente: 'Cliente A',
    segmento: 'E-commerce',
    status: 'ativo',
    createdAt: minutesAgo(60 * 24 * 120),
  },
  {
    id: 's2',
    nome: 'Blog Cliente B',
    url: 'https://blog.cliente-b.com',
    ga4PropertyId: '100200301',
    cliente: 'Cliente B',
    segmento: 'Conteúdo',
    status: 'ativo',
    createdAt: minutesAgo(60 * 24 * 76),
  },
  {
    id: 's3',
    nome: 'Site Institucional C',
    url: 'https://institucional.cliente-c.com',
    ga4PropertyId: '100200302',
    cliente: 'Cliente C',
    segmento: 'Institucional',
    status: 'ativo',
    createdAt: minutesAgo(60 * 24 * 58),
  },
  {
    id: 's4',
    nome: 'Landing Campanha D',
    url: 'https://campanha.cliente-d.com',
    ga4PropertyId: '123456789',
    cliente: 'Cliente D',
    segmento: 'Campanha',
    status: 'ativo',
    createdAt: minutesAgo(60 * 24 * 40),
  },
  {
    id: 's5',
    nome: 'Portfólio Cliente E',
    url: 'https://portfolio.cliente-e.com',
    ga4PropertyId: '100200304',
    cliente: 'Cliente E',
    segmento: 'Portfólio',
    status: 'pausado',
    createdAt: minutesAgo(60 * 24 * 32),
  },
  {
    id: 's6',
    nome: 'Hotsite Cliente F',
    url: 'https://hotsite.cliente-f.com',
    ga4PropertyId: '100200305',
    cliente: 'Cliente F',
    segmento: 'Lançamento',
    status: 'arquivado',
    createdAt: minutesAgo(60 * 24 * 180),
  },
];

const INITIAL_SYNC_STATES: Record<string, SyncState> = {
  s1: {
    siteId: 's1',
    status: 'error',
    lastSyncAt: minutesAgo(60 * 49),
    errorMessage: 'A propriedade GA4 rejeitou a última coleta.',
  },
  s2: {
    siteId: 's2',
    status: 'running',
    lastSyncAt: null,
    errorMessage: null,
  },
  s3: {
    siteId: 's3',
    status: 'ok',
    lastSyncAt: minutesAgo(18),
    errorMessage: null,
  },
  s4: {
    siteId: 's4',
    status: 'ok',
    lastSyncAt: minutesAgo(12),
    errorMessage: null,
  },
  s5: {
    siteId: 's5',
    status: 'no_data',
    lastSyncAt: minutesAgo(60 * 24 * 3),
    errorMessage: null,
  },
  s6: {
    siteId: 's6',
    status: 'ok',
    lastSyncAt: minutesAgo(60 * 24 * 12),
    errorMessage: null,
  },
};

const INITIAL_USER_TOTALS: Partial<Record<string, { atual: number; anterior: number }>> = {
  s1: { atual: 3680, anterior: 4210 },
  s3: { atual: 1820, anterior: 3140 },
  s4: { atual: 7430, anterior: 4560 },
  s6: { atual: 980, anterior: 1000 },
};

const EMPTY_DETAIL: SiteDetail = {
  cards: {
    usuarios: { atual: 0, anterior: 0, variation: toVariation(null) },
    sessoes: { atual: 0, anterior: 0, variation: toVariation(null) },
    pageviews: { atual: 0, anterior: 0, variation: toVariation(null) },
    conversoes: { atual: 0, anterior: 0, variation: toVariation(null) },
  },
  trend: [],
  channels: [],
  pages: [],
};

type AnalyticsStore = Record<string, SiteDetail>;

function cloneSite(site: Site): Site {
  return { ...site };
}

function cloneSyncState(sync: SyncState): SyncState {
  return { ...sync };
}

function cloneMetricPair(pair: MetricPair): MetricPair {
  return { ...pair, variation: { ...pair.variation } };
}

function cloneTrendPoint(point: TrendPoint): TrendPoint {
  return { ...point };
}

function cloneChannelRow(row: ChannelRow): ChannelRow {
  return { ...row, varUsuarios: { ...row.varUsuarios } };
}

function clonePageRow(row: PageRow): PageRow {
  return { ...row, varPageviews: { ...row.varPageviews } };
}

function cloneSiteDetail(detail: SiteDetail): SiteDetail {
  return {
    cards: {
      usuarios: cloneMetricPair(detail.cards.usuarios),
      sessoes: cloneMetricPair(detail.cards.sessoes),
      pageviews: cloneMetricPair(detail.cards.pageviews),
      conversoes: cloneMetricPair(detail.cards.conversoes),
    },
    trend: detail.trend.map(cloneTrendPoint),
    channels: detail.channels.map(cloneChannelRow),
    pages: detail.pages.map(clonePageRow),
  };
}

function pct(cur: number, prev: number) {
  if (prev === 0) return null;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

function makePair(atual: number, anterior: number): MetricPair {
  return { atual, anterior, variation: toVariation(pct(atual, anterior)) };
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function distributeTotal(total: number, weights: number[]) {
  if (total <= 0) return weights.map(() => 0);
  const sum = weights.reduce((acc, weight) => acc + weight, 0);
  const raw = weights.map((weight) => (weight / sum) * total);
  const rounded = raw.map((value) => Math.floor(value));
  let remainder = total - rounded.reduce((acc, value) => acc + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  for (const item of order) {
    if (remainder <= 0) break;
    rounded[item.index] += 1;
    remainder -= 1;
  }

  return rounded;
}

function getHostLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function buildTrendSeries(total: number, seed: number) {
  const rng = createRng(seed);
  const weights = TREND_LABELS.map((_label, index) => {
    const weekdayBias = [0.92, 1, 0.98, 1.04, 1.12, 0.86, 0.8][index];
    return weekdayBias * (0.8 + rng() * 0.5);
  });

  return distributeTotal(total, weights);
}

function buildChannelRows(site: Site, usersCur: number, usersPrev: number, sessionsCur: number, conversionsCur: number, seed: number): ChannelRow[] {
  const rng = createRng(seed ^ 0xabcdef);
  const baseWeights = CHANNELS.map((channel) => {
    if (site.segmento?.toLowerCase().includes('campanha') && channel === 'Pago') return 1.8;
    if (site.segmento?.toLowerCase().includes('conteúdo') && channel === 'Orgânico') return 1.7;
    return 0.8 + rng() * 1.2;
  });

  const currentUsers = distributeTotal(usersCur, baseWeights);
  const previousUsers = distributeTotal(
    usersPrev,
    baseWeights.map((weight) => weight * (0.75 + rng() * 0.6)),
  );
  const currentSessions = distributeTotal(
    sessionsCur,
    currentUsers.map((value) => Math.max(1, value * (1.05 + rng() * 0.35))),
  );
  const currentConversions = distributeTotal(
    conversionsCur,
    currentUsers.map((value, index) => value * [0.9, 0.75, 1.3, 0.65][index]),
  );

  return CHANNELS.map((channel, index) => ({
    canal: channel,
    usuarios: currentUsers[index],
    sessoes: currentSessions[index],
    conversoes: currentConversions[index],
    varUsuarios: toVariation(pct(currentUsers[index], previousUsers[index])),
  })).sort((a, b) => b.usuarios - a.usuarios);
}

function buildPageRows(site: Site, pageviewsCur: number, pageviewsPrev: number, seed: number): PageRow[] {
  const rng = createRng(seed ^ 0x123456);
  const host = getHostLabel(site.url);
  const defs =
    site.segmento?.toLowerCase().includes('campanha')
      ? [
          ['/', 'Landing principal'],
          ['/oferta', 'Oferta'],
          ['/checkout', 'Checkout'],
          ['/faq', 'Perguntas frequentes'],
          ['/obrigado', 'Obrigado'],
        ]
      : [
          ['/', host],
          ['/servicos', 'Serviços'],
          ['/blog', 'Blog'],
          ['/contato', 'Contato'],
          ['/sobre', 'Sobre'],
        ];

  const currentViews = distributeTotal(
    pageviewsCur,
    defs.map((_page, index) => (index === 0 ? 2.4 : 0.8 + rng() * 1.3)),
  );
  const previousViews = distributeTotal(
    pageviewsPrev,
    defs.map((_page, index) => (index === 0 ? 2.1 : 0.75 + rng() * 1.1)),
  );
  const total = currentViews.reduce((acc, value) => acc + value, 0);

  return defs.map(([pagePath, pageTitle], index) => ({
    pagePath,
    pageTitle,
    pageviews: currentViews[index],
    varPageviews: toVariation(pct(currentViews[index], previousViews[index])),
    pctTotal: total === 0 ? null : Math.round((currentViews[index] / total) * 1000) / 10,
  }));
}

function resolveUsersPair(site: Site) {
  const preset = INITIAL_USER_TOTALS[site.id];
  if (preset) return preset;

  const rng = createRng(hashString(`${site.id}:${site.url}:${site.ga4PropertyId}`));
  const anterior = 900 + Math.round(rng() * 5600);
  const delta = -0.18 + rng() * 0.72;
  const atual = Math.max(120, Math.round(anterior * (1 + delta)));
  return { atual, anterior };
}

function generateLocalSiteDetail(site: Site): SiteDetail {
  const seed = hashString(`${site.id}:${site.url}:${site.ga4PropertyId}`);
  const rng = createRng(seed);
  const { atual: usersCur, anterior: usersPrev } = resolveUsersPair(site);

  const sessionsCur = Math.round(usersCur * (1.15 + rng() * 0.28));
  const sessionsPrev = Math.round(usersPrev * (1.12 + rng() * 0.25));
  const pageviewsCur = Math.round(sessionsCur * (2.1 + rng() * 1.15));
  const pageviewsPrev = Math.round(sessionsPrev * (2 + rng() * 1.05));
  const conversionRateCur = 0.022 + rng() * 0.08;
  const conversionRatePrev = 0.02 + rng() * 0.075;
  const conversionsCur = Math.max(0, Math.round(sessionsCur * conversionRateCur));
  const conversionsPrev = Math.max(0, Math.round(sessionsPrev * conversionRatePrev));

  const trendCurrent = buildTrendSeries(usersCur, seed);
  const trendPrevious = buildTrendSeries(usersPrev, seed ^ 0x9e3779b9);

  return {
    cards: {
      usuarios: makePair(usersCur, usersPrev),
      sessoes: makePair(sessionsCur, sessionsPrev),
      pageviews: makePair(pageviewsCur, pageviewsPrev),
      conversoes: makePair(conversionsCur, conversionsPrev),
    },
    trend: TREND_LABELS.map((dia, index) => ({
      dia,
      atual: trendCurrent[index],
      anterior: trendPrevious[index],
    })),
    channels: buildChannelRows(site, usersCur, usersPrev, sessionsCur, conversionsCur, seed),
    pages: buildPageRows(site, pageviewsCur, pageviewsPrev, seed),
  };
}

function buildSyncSuccess(siteId: string): SyncState {
  return {
    siteId,
    status: 'ok',
    lastSyncAt: new Date().toISOString(),
    errorMessage: null,
  };
}

function normalizeSyncStates(states: Record<string, SyncState>) {
  return Object.fromEntries(
    Object.entries(states).map(([siteId, sync]) => [
      siteId,
      sync.status === 'running' ? buildSyncSuccess(siteId) : cloneSyncState(sync),
    ]),
  );
}

function loadSitesStore() {
  return readLocalStorageJSON<Site[]>(SITES_STORAGE_KEY, INITIAL_SITES).map(cloneSite);
}

function loadSyncStore() {
  return normalizeSyncStates(readLocalStorageJSON<Record<string, SyncState>>(SYNC_STORAGE_KEY, INITIAL_SYNC_STATES));
}

function loadAnalyticsStore(sites: Site[], syncStates: Record<string, SyncState>) {
  const raw = readLocalStorageJSON<AnalyticsStore>(ANALYTICS_STORAGE_KEY, {});
  const analytics = Object.fromEntries(
    Object.entries(raw)
      .filter(([siteId]) => sites.some((site) => site.id === siteId))
      .map(([siteId, detail]) => [siteId, cloneSiteDetail(detail)]),
  ) as AnalyticsStore;

  for (const site of sites) {
    const sync = syncStates[site.id];
    const shouldHaveAnalytics =
      sync?.status === 'ok' ||
      sync?.status === 'error' ||
      (sync?.status === 'running' && INITIAL_USER_TOTALS[site.id] !== undefined);

    if (shouldHaveAnalytics && !analytics[site.id]) {
      analytics[site.id] = generateLocalSiteDetail(site);
    }
  }

  return analytics;
}

function persistStores() {
  writeLocalStorageJSON(SITES_STORAGE_KEY, mockSitesStore);
  writeLocalStorageJSON(SYNC_STORAGE_KEY, mockSyncStatesStore);
  writeLocalStorageJSON(ANALYTICS_STORAGE_KEY, mockAnalyticsStore);
  emitMockDataChanged();
}

let mockSitesStore: Site[] = loadSitesStore();
let mockSyncStatesStore: Record<string, SyncState> = loadSyncStore();
let mockAnalyticsStore: AnalyticsStore = loadAnalyticsStore(mockSitesStore, mockSyncStatesStore);
persistStores();

function scheduleMockSyncSuccess(siteId: string, ms = 2200) {
  setTimeout(() => {
    const site = mockSitesStore.find((entry) => entry.id === siteId);
    if (!site) return;
    mockSyncStatesStore = { ...mockSyncStatesStore, [siteId]: buildSyncSuccess(siteId) };
    mockAnalyticsStore = { ...mockAnalyticsStore, [siteId]: generateLocalSiteDetail(site) };
    persistStores();
  }, ms);
}

export function getMockSitesSnapshot(): Site[] {
  return mockSitesStore.map(cloneSite);
}

export function getMockSyncStatesSnapshot(): Record<string, SyncState> {
  return Object.fromEntries(Object.entries(mockSyncStatesStore).map(([key, value]) => [key, cloneSyncState(value)]));
}

export function getMockSiteDetailSnapshot(id: string): SiteDetail {
  return cloneSiteDetail(mockAnalyticsStore[id] ?? EMPTY_DETAIL);
}

export function getMockOverviewSignalsSnapshot(): SiteSignal[] {
  return mockSitesStore
    .filter((site) => site.status !== 'arquivado')
    .map((site) => {
      const sync = mockSyncStatesStore[site.id] ?? null;
      const detail = mockAnalyticsStore[site.id] ?? EMPTY_DETAIL;

      let attentionReason: AttentionReason = null;
      if (
        sync === null ||
        sync.status === 'error' ||
        sync.status === 'running' ||
        sync.status === 'no_data' ||
        sync.lastSyncAt === null ||
        Date.now() - new Date(sync.lastSyncAt).getTime() > 24 * 60 * 60 * 1000
      ) {
        attentionReason = 'technical';
      } else {
        const usersPct = detail.cards.usuarios.variation.pct ?? 0;
        if (usersPct <= -30) attentionReason = 'drop';
        else if (usersPct >= 50) attentionReason = 'spike';
      }

      return {
        siteId: site.id,
        nome: site.nome,
        cliente: site.cliente,
        status: site.status,
        syncStatus: sync?.status ?? null,
        lastSyncAt: sync?.lastSyncAt ?? null,
        usuarios: cloneMetricPair(detail.cards.usuarios),
        conversoes: cloneMetricPair(detail.cards.conversoes),
        attentionReason,
      };
    })
    .sort(
      (a, b) => attentionRank(a.attentionReason) - attentionRank(b.attentionReason) || a.nome.localeCompare(b.nome),
    );
}

export function getMockPortfolioTrendSnapshot(): PortfolioTrendPoint[] {
  return TREND_LABELS.map((dia, index) => ({
    dia,
    usuarios: mockSitesStore
      .filter((site) => site.status !== 'arquivado')
      .reduce((acc, site) => acc + (mockAnalyticsStore[site.id]?.trend[index]?.atual ?? 0), 0),
  }));
}

export function resetMockSitesData() {
  mockSitesStore = INITIAL_SITES.map(cloneSite);
  mockSyncStatesStore = normalizeSyncStates(INITIAL_SYNC_STATES);
  mockAnalyticsStore = loadAnalyticsStore(mockSitesStore, mockSyncStatesStore);
  persistStores();
}

export function removeMockSiteByName(name: string) {
  const site = mockSitesStore.find((item) => item.nome === name);
  if (!site) return false;

  mockSitesStore = mockSitesStore.filter((item) => item.id !== site.id);
  mockSyncStatesStore = Object.fromEntries(
    Object.entries(mockSyncStatesStore).filter(([siteId]) => siteId !== site.id),
  );
  mockAnalyticsStore = Object.fromEntries(
    Object.entries(mockAnalyticsStore).filter(([siteId]) => siteId !== site.id),
  );
  persistStores();
  return true;
}

export function mockListSites(demo: string | null): Promise<Site[]> {
  if (demo === 'loading') return new Promise<Site[]>(() => {});
  if (demo === 'error') return Promise.reject(new Error('Falha simulada ao carregar os sites'));
  if (demo === 'empty') return Promise.resolve([]);
  return Promise.resolve(mockSitesStore.map(cloneSite));
}

export function mockListSyncStates(demo: string | null): Promise<Record<string, SyncState>> {
  if (demo === 'loading') return new Promise<Record<string, SyncState>>(() => {});
  if (demo === 'syncerror') return Promise.reject(new Error('Falha simulada ao carregar o estado de sync'));
  return Promise.resolve(
    Object.fromEntries(Object.entries(mockSyncStatesStore).map(([key, value]) => [key, cloneSyncState(value)])),
  );
}

export function getMockSiteById(id: string): Site | null {
  const site = mockSitesStore.find((item) => item.id === id);
  return site ? cloneSite(site) : null;
}

export function getMockSyncStateBySiteId(id: string): SyncState | null {
  const sync = mockSyncStatesStore[id];
  return sync ? cloneSyncState(sync) : null;
}

// Simula insert + primeiro sync (backfill 30 dias) com atraso, para exercitar o estado
// "Conectando analytics…". Property ID '000000000' rejeita → preview do estado de erro.
export async function mockCreateSite(input: SiteInput): Promise<Site> {
  await delay(1600);
  if (input.ga4PropertyId === '000000000') {
    throw new Error('Property ID inválido ou sem acesso à propriedade.');
  }

  const site: Site = {
    id: `mock-site-${Date.now()}`,
    nome: input.nome,
    url: input.url,
    ga4PropertyId: input.ga4PropertyId,
    cliente: input.cliente ?? null,
    segmento: input.segmento ?? null,
    status: input.status ?? 'ativo',
    createdAt: new Date().toISOString(),
  };

  mockSitesStore = [site, ...mockSitesStore];
  mockSyncStatesStore = {
    ...mockSyncStatesStore,
    [site.id]: { siteId: site.id, status: 'running', lastSyncAt: null, errorMessage: null },
  };
  mockAnalyticsStore = Object.fromEntries(Object.entries(mockAnalyticsStore).filter(([siteId]) => siteId !== site.id));
  persistStores();
  scheduleMockSyncSuccess(site.id);

  return cloneSite(site);
}

export async function mockUpdateSite(id: string, input: SiteInput): Promise<Site> {
  await delay(900);
  const index = mockSitesStore.findIndex((site) => site.id === id);
  if (index === -1) {
    throw new Error('Site não encontrado.');
  }

  const current = mockSitesStore[index];
  const ga4Changed = current.ga4PropertyId !== input.ga4PropertyId;
  const updated: Site = {
    ...current,
    nome: input.nome,
    url: input.url,
    ga4PropertyId: input.ga4PropertyId,
    cliente: input.cliente ?? null,
    segmento: input.segmento ?? null,
    status: input.status ?? current.status,
  };

  mockSitesStore = mockSitesStore.map((site) => (site.id === id ? updated : site));
  if (ga4Changed) {
    mockSyncStatesStore = {
      ...mockSyncStatesStore,
      [id]: { siteId: id, status: 'running', lastSyncAt: null, errorMessage: null },
    };
    mockAnalyticsStore = Object.fromEntries(Object.entries(mockAnalyticsStore).filter(([siteId]) => siteId !== id));
    persistStores();
    scheduleMockSyncSuccess(id, 1800);
  } else {
    if (mockSyncStatesStore[id]?.status === 'ok' || mockSyncStatesStore[id]?.status === 'error') {
      mockAnalyticsStore = { ...mockAnalyticsStore, [id]: generateLocalSiteDetail(updated) };
    }
    persistStores();
  }

  return cloneSite(updated);
}

export async function mockArchiveSite(id: string): Promise<void> {
  await delay(700);
  const exists = mockSitesStore.some((site) => site.id === id);
  if (!exists) {
    throw new Error('Site não encontrado.');
  }
  mockSitesStore = mockSitesStore.map((site) => (site.id === id ? { ...site, status: 'arquivado' } : site));
  persistStores();
}

export async function mockTriggerSiteSync(siteId: string): Promise<void> {
  await delay(900);
  if (!mockSitesStore.some((site) => site.id === siteId)) {
    throw new Error('Site não encontrado.');
  }

  mockSyncStatesStore = {
    ...mockSyncStatesStore,
    [siteId]: { siteId, status: 'running', lastSyncAt: null, errorMessage: null },
  };
  mockAnalyticsStore = Object.fromEntries(Object.entries(mockAnalyticsStore).filter(([id]) => id !== siteId));
  persistStores();
  scheduleMockSyncSuccess(siteId, 1600);
}
