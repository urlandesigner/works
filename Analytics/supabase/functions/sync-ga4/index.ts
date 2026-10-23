// Edge Function: sincroniza GA4 → Supabase.
//
// Acionamento:
//   - cadastro de site → invoca com { site_id } → primeiro sync (backfill 30 dias).
//   - pg_cron diário    → invoca sem body       → todos os sites, janela incremental (3 dias).
//
// Parâmetros (body opcional):
//   - site_id?: string  → processa só aquele site (senão, todos os não-arquivados).
//   - days?: number     → força a janela. Se ausente, decide por site:
//                         nunca sincronizado (last_sync_at null) → BACKFILL_DAYS; senão → INCREMENTAL_DAYS.
//
// Upsert idempotente garante que backfill e incremental nunca duplicam.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  getAccessToken,
  fetchTotals,
  fetchPages,
  fetchChannels,
  ga4DateToIso,
  toInt,
  type ServiceAccount,
} from './ga4.ts';

const BACKFILL_DAYS = 30; // primeiro sync: histórico p/ 7v7, tendência, ranking e atenção
const INCREMENTAL_DAYS = 3; // syncs recorrentes: corrige dados tardios do GA4
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

function getServiceAccount(): ServiceAccount {
  const raw = Deno.env.get('GA4_SERVICE_ACCOUNT_JSON');
  if (!raw) throw new Error('GA4_SERVICE_ACCOUNT_JSON não configurado');
  const sa = JSON.parse(raw) as ServiceAccount & { private_key: string };
  sa.private_key = sa.private_key.replace(/\\n/g, '\n'); // \n escapado em env
  return sa;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let body: RequestBody = {};
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    // sem body (chamada do cron) → mantém defaults
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

  // Mapa de último sync por site → decide backfill vs incremental quando `days` não vem no body.
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

  const sa = getServiceAccount();
  const token = await getAccessToken(sa);
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
