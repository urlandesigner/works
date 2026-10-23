import { getSupabase } from '@/integrations/supabase/client';
import type { SiteInput } from '@/types';
import type { SiteRow, SiteInsert } from '@/types/db';

function toInsert(input: SiteInput): SiteInsert {
  return {
    nome: input.nome,
    url: input.url,
    ga4_property_id: input.ga4PropertyId,
    cliente: input.cliente ?? null,
    segmento: input.segmento ?? null,
    status: input.status ?? 'ativo',
  };
}

// Acesso cru à tabela `site`. Sem regra de negócio — mapeamento fica no serviço.
export const sitesRepository = {
  async list(): Promise<SiteRow[]> {
    const { data, error } = await getSupabase().from('site').select('*').order('nome');
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<SiteRow | null> {
    const { data, error } = await getSupabase().from('site').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(input: SiteInput): Promise<SiteRow> {
    const { data, error } = await getSupabase()
      .from('site')
      .insert(toInsert(input))
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, input: SiteInput): Promise<SiteRow> {
    const { data, error } = await getSupabase()
      .from('site')
      .update(toInsert(input))
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async archive(id: string): Promise<void> {
    const { error } = await getSupabase().from('site').update({ status: 'arquivado' }).eq('id', id);
    if (error) throw error;
  },
};
