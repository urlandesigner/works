// Dashboard-ready version of the `sync-ga4` Edge Function.
// Use this file when deploying via Supabase Dashboard editor.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BACKFILL_DAYS = 30;
const INCREMENTAL_DAYS = 3;
const CONVERSION_METRIC = 'conversions';
const GA4_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
};

interface SiteRow {
  id: string;
  ga4_property_id: string;
}

interface RequestBody {
  site_id?: string;
  days?: number;
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

interface Ga4Row {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
}

interface RunReportBody {
  dateRanges: { startDate: string; endDate: string }[];
  dimensions: { name: string }[];
  metrics: { name: string }[];
  limit?: string;
}

function getServiceAccount(): ServiceAccount {
  const raw = Deno.env.get('GA4_SERVICE_ACCOUNT_JSON');
  if (!raw) throw new Error('GA4_SERVICE_ACCOUNT_JSON não configurado');
  const sa = JSON.parse(raw) as ServiceAccount & { private_key: string };
  sa.private_key = sa.private_key.replace(/\\n/g, '\n');
  return sa;
}

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
  for (let i = 0; i < bin.length; i += 1) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
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

function dateRange(days: number) {
  return [{ startDate: `${days}daysAgo`, endDate: 'yesterday' }];
}

async function runReport(token: string, propertyId: string, body: RunReportBody): Promise<Ga4Row[]> {
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

function fetchTotals(token: string, propertyId: string, days: number) {
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

function fetchPages(token: string, propertyId: string, days: number) {
  return runReport(token, propertyId, {
    dateRanges: dateRange(days),
    dimensions: [{ name: 'date' }, { name: 'pagePath' }, { name: 'pageTitle' }],
    metrics: [{ name: 'screenPageViews' }],
    limit: '100000',
  });
}

function fetchChannels(token: string, propertyId: string, days: number) {
  return runReport(token, propertyId, {
    dateRanges: dateRange(days),
    dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: CONVERSION_METRIC }],
  });
}

function ga4DateToIso(d: string): string {
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

function toInt(v: string | undefined): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let body: RequestBody = {};
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    // chamada sem body
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let siteQuery = supabase.from('site').select('id, ga4_property_id').neq('status', 'arquivado');
  if (body.site_id) siteQuery = siteQuery.eq('id', body.site_id);

  const { data: sites, error: sitesError } = await siteQuery;
  if (sitesError) {
    return new Response(JSON.stringify({ error: sitesError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }

  const siteList = (sites ?? []) as SiteRow[];
  if (siteList.length === 0) {
    return new Response(JSON.stringify({ synced: {} }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }

  const { data: states } = await supabase
    .from('sync_state')
    .select('site_id, last_sync_at')
    .in(
      'site_id',
      siteList.map((s) => s.id),
    );
  const lastSyncBySite = new Map<string, string | null>(
    (states ?? []).map((s) => [s.site_id, s.last_sync_at]),
  );

  const forcedDays = typeof body.days === 'number' && body.days > 0 ? body.days : null;
  const token = await getAccessToken(getServiceAccount());
  const results: Record<string, string> = {};

  for (const site of siteList) {
    const neverSynced = !lastSyncBySite.get(site.id);
    const days = forcedDays ?? (neverSynced ? BACKFILL_DAYS : INCREMENTAL_DAYS);

    await supabase.from('sync_state').upsert({ site_id: site.id, status: 'running' });

    try {
      const [totals, pages, channels] = await Promise.all([
        fetchTotals(token, site.ga4_property_id, days),
        fetchPages(token, site.ga4_property_id, days),
        fetchChannels(token, site.ga4_property_id, days),
      ]);

      const metricaRows = totals.map((r) => ({
        site_id: site.id,
        data: ga4DateToIso(r.dimensionValues[0].value),
        usuarios: toInt(r.metricValues[0]?.value),
        sessoes: toInt(r.metricValues[1]?.value),
        pageviews: toInt(r.metricValues[2]?.value),
        conversoes: toInt(r.metricValues[3]?.value),
      }));

      const paginaRows = pages.map((r) => ({
        site_id: site.id,
        data: ga4DateToIso(r.dimensionValues[0].value),
        page_path: r.dimensionValues[1].value,
        page_title: r.dimensionValues[2]?.value ?? null,
        pageviews: toInt(r.metricValues[0]?.value),
      }));

      const canalRows = channels.map((r) => ({
        site_id: site.id,
        data: ga4DateToIso(r.dimensionValues[0].value),
        canal: r.dimensionValues[1].value,
        usuarios: toInt(r.metricValues[0]?.value),
        sessoes: toInt(r.metricValues[1]?.value),
        conversoes: toInt(r.metricValues[2]?.value),
      }));

      if (metricaRows.length) {
        await supabase.from('metrica').upsert(metricaRows, { onConflict: 'site_id,data' });
      }
      if (paginaRows.length) {
        await supabase
          .from('pagina_metrica')
          .upsert(paginaRows, { onConflict: 'site_id,data,page_path' });
      }
      if (canalRows.length) {
        await supabase
          .from('canal_metrica')
          .upsert(canalRows, { onConflict: 'site_id,data,canal' });
      }

      const status = metricaRows.length ? 'ok' : 'no_data';
      await supabase.from('sync_state').upsert({
        site_id: site.id,
        status,
        last_sync_at: new Date().toISOString(),
        error_message: null,
      });
      results[site.id] = `${status} (${days}d)`;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await supabase.from('sync_state').upsert({
        site_id: site.id,
        status: 'error',
        error_message: message,
      });
      results[site.id] = `error: ${message}`;
    }
  }

  return new Response(JSON.stringify({ synced: results }), {
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
});
