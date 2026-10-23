import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { getSupabase } from '@/integrations/supabase/client';
import type { SyncStatus } from '@/types';
import type { SyncStateRow } from '@/types/db';

type SyncFunctionResponse = {
  synced?: Record<string, string>;
  error?: string;
};

function normalizeGa4Error(message: string): string {
  if (message.includes('User does not have sufficient permissions for this property')) {
    return 'O GA4 recusou acesso a esta propriedade. Adicione o e-mail da service account como Viewer na propriedade do Google Analytics e tente novamente.';
  }

  if (message.includes('GA4_SERVICE_ACCOUNT_JSON não configurado')) {
    return 'A função sync-ga4 está sem a credencial do Google. Cadastre o secret GA4_SERVICE_ACCOUNT_JSON no Supabase.';
  }

  return message;
}

function toTriggerError(error: unknown): Error {
  if (error instanceof FunctionsFetchError) {
    return new Error(
      'Não foi possível alcançar a Edge Function. Verifique se `sync-ga4` foi deployada no Supabase e se o projeto está online.',
    );
  }

  if (error instanceof FunctionsRelayError) {
    return new Error('O gateway do Supabase não conseguiu encaminhar a chamada para a Edge Function.');
  }

  if (error instanceof FunctionsHttpError) {
    return new Error('A Edge Function respondeu com erro. Verifique os logs da `sync-ga4` no Supabase.');
  }

  if (error instanceof Error) {
    return new Error(normalizeGa4Error(error.message));
  }

  return new Error('Não foi possível iniciar a sincronização deste site.');
}

// Estado de sincronização por site — alimenta os badges de frescor e o status na tela de Configurações.
export const syncRepository = {
  async list(): Promise<SyncStateRow[]> {
    const { data, error } = await getSupabase().from('sync_state').select('*');
    if (error) throw error;
    return data ?? [];
  },

  async getBySite(siteId: string): Promise<SyncStateRow | null> {
    const { data, error } = await getSupabase()
      .from('sync_state')
      .select('*')
      .eq('site_id', siteId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // Dispara a Edge Function sync-ga4 para um site específico (primeiro sync / backfill 30 dias).
  async trigger(siteId: string): Promise<void> {
    const { data, error } = await getSupabase().functions.invoke<SyncFunctionResponse>('sync-ga4', {
      body: { site_id: siteId },
    });
    if (error) throw toTriggerError(error);

    if (data?.error) {
      throw new Error(normalizeGa4Error(data.error));
    }

    const siteResult = data?.synced?.[siteId];
    if (siteResult?.startsWith('error:')) {
      throw new Error(normalizeGa4Error(siteResult.slice('error:'.length).trim()));
    }
  },

  async setState(input: {
    siteId: string;
    status: SyncStatus;
    errorMessage?: string | null;
    lastSyncAt?: string | null;
  }): Promise<void> {
    const { error } = await getSupabase().from('sync_state').upsert({
      site_id: input.siteId,
      status: input.status,
      error_message: input.errorMessage ?? null,
      last_sync_at: input.lastSyncAt ?? null,
    });
    if (error) throw error;
  },
};
