// Cliente do Google Analytics 4 Data API (server-side, dentro da Edge Function).
// Autenticação via service account (JWT RS256 → access token). O browser nunca toca isto.

export interface ServiceAccount {
  client_email: string;
  private_key: string;
}

// Métrica de conversões no GA4 Data API. Em propriedades novas pode ser 'keyEvents'
// (eventos-chave). Trocar aqui caso a property retorne erro de métrica inexistente.
export const CONVERSION_METRIC = 'conversions';

const GA4_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

function base64url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlBytes(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return base64url(bin);
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const bin = atob(body);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

export async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope: GA4_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned),
  );
  const jwt = `${unsigned}.${base64urlBytes(new Uint8Array(sigBuf))}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) throw new Error(`Falha ao obter token GA4: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error('Token GA4 ausente na resposta');
  return json.access_token;
}

export interface Ga4Row {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
}

interface RunReportBody {
  dateRanges: { startDate: string; endDate: string }[];
  dimensions: { name: string }[];
  metrics: { name: string }[];
  limit?: string;
}

async function runReport(
  token: string,
  propertyId: string,
  body: RunReportBody,
): Promise<Ga4Row[]> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(`GA4 runReport ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { rows?: Ga4Row[] };
  return json.rows ?? [];
}

// Janela de re-busca: últimos N dias até ontem (corrige dados tardios do GA4).
function dateRange(days: number) {
  return [{ startDate: `${days}daysAgo`, endDate: 'yesterday' }];
}

export function fetchTotals(token: string, propertyId: string, days: number) {
  return runReport(token, propertyId, {
    dateRanges: dateRange(days),
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: CONVERSION_METRIC },
    ],
  });
}

export function fetchPages(token: string, propertyId: string, days: number) {
  return runReport(token, propertyId, {
    dateRanges: dateRange(days),
    dimensions: [{ name: 'date' }, { name: 'pagePath' }, { name: 'pageTitle' }],
    metrics: [{ name: 'screenPageViews' }],
    limit: '100000',
  });
}

export function fetchChannels(token: string, propertyId: string, days: number) {
  return runReport(token, propertyId, {
    dateRanges: dateRange(days),
    dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: CONVERSION_METRIC }],
  });
}

// 'YYYYMMDD' (GA4) → 'YYYY-MM-DD' (Postgres date).
export function ga4DateToIso(d: string): string {
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

export function toInt(v: string | undefined): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
}
