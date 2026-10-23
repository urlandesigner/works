import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingState } from '@/components/states/LoadingState';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { SyncBadge } from '@/components/ui/SyncBadge';
import { useArchiveSite, useSite, useUpdateSite } from '@/hooks/useSites';
import { useSiteSync, useTriggerSiteSync } from '@/hooks/useSiteSync';
import { formatRelativeTime } from '@/lib/format';
import type { SiteInput, SiteStatus } from '@/types';
import { normalizeUrl, validateSiteForm, type SiteFormErrors, type SiteFormValues } from './validateSite';

type EditValues = SiteFormValues & {
  cliente: string;
  segmento: string;
  status: SiteStatus;
};

const STATUS_OPTIONS: SiteStatus[] = ['ativo', 'pausado', 'arquivado'];

function toInitialValues(site: NonNullable<ReturnType<typeof useSite>['data']>): EditValues {
  return {
    nome: site.nome,
    url: site.url,
    ga4PropertyId: site.ga4PropertyId,
    cliente: site.cliente ?? '',
    segmento: site.segmento ?? '',
    status: site.status,
  };
}

export function SiteEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const site = useSite(id);
  const sync = useSiteSync(id);
  const updateSite = useUpdateSite(id);
  const archiveSite = useArchiveSite();
  const triggerSync = useTriggerSiteSync();
  const [values, setValues] = useState<EditValues | null>(null);
  const [errors, setErrors] = useState<SiteFormErrors>({});

  if (site.isLoading || sync.isLoading) return <LoadingState />;

  if (site.isError || sync.isError) {
    return (
      <ErrorState
        title="Não foi possível abrir a edição"
        description="Ocorreu um erro ao buscar os dados deste site."
        onRetry={() => {
          site.refetch();
          sync.refetch();
        }}
      />
    );
  }

  if (!site.data) {
    return (
      <EmptyState
        title="Site não encontrado"
        description="O site solicitado não existe ou não está mais disponível no inventário."
        action={
          <Link
            to="/sites"
            className="inline-flex items-center rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Voltar para Sites
          </Link>
        }
      />
    );
  }

  const currentSite = site.data;
  const currentValues = values ?? toInitialValues(site.data);
  const pending = updateSite.isPending || archiveSite.isPending || triggerSync.isPending;
  const syncState = sync.data ?? null;
  const updateError =
    updateSite.isError && updateSite.error instanceof Error ? updateSite.error.message : undefined;
  const archiveError =
    archiveSite.isError && archiveSite.error instanceof Error ? archiveSite.error.message : undefined;
  const syncError =
    triggerSync.isError && triggerSync.error instanceof Error ? triggerSync.error.message : undefined;

  function updateField<K extends keyof EditValues>(field: K, value: EditValues[K]) {
    setValues((prev) => ({ ...(prev ?? toInitialValues(site.data!)), [field]: value }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (updateSite.isError) updateSite.reset();
    if (archiveSite.isError) archiveSite.reset();
    if (triggerSync.isError) triggerSync.reset();
  }

  function onInput(field: keyof EditValues) {
    return (event: ChangeEvent<HTMLInputElement>) => updateField(field, event.target.value as EditValues[typeof field]);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateSiteForm(currentValues);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    const input: SiteInput = {
      nome: currentValues.nome.trim(),
      url: normalizeUrl(currentValues.url),
      ga4PropertyId: currentValues.ga4PropertyId.trim(),
      cliente: currentValues.cliente.trim() || null,
      segmento: currentValues.segmento.trim() || null,
      status: currentValues.status,
    };

    updateSite.mutate(input, {
      onSuccess: () => navigate(`/sites/${id}`),
    });
  }

  function onArchive() {
    if (!window.confirm(`Arquivar "${currentSite.nome}"? O site continuará visível no inventário, mas fora da operação ativa.`)) {
      return;
    }
    archiveSite.mutate(id, { onSuccess: () => navigate('/sites') });
  }

  return (
    <div className="space-y-6">
      <Topbar
        title="Editar site"
        subtitle={currentSite.nome}
        actions={
          <Link
            to={`/sites/${id}`}
            className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Ver dashboard
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                label="Nome do site"
                name="nome"
                value={currentValues.nome}
                onChange={onInput('nome')}
                error={errors.nome}
                placeholder="Ex.: Loja do Cliente A"
                disabled={pending}
                autoFocus
                required
              />
              <FormField
                label="URL do site"
                name="url"
                value={currentValues.url}
                onChange={onInput('url')}
                error={errors.url}
                placeholder="https://seusite.com"
                disabled={pending}
                required
              />
              <FormField
                label="GA4 Property ID"
                name="ga4PropertyId"
                value={currentValues.ga4PropertyId}
                onChange={onInput('ga4PropertyId')}
                error={errors.ga4PropertyId}
                placeholder="Ex.: 123456789"
                disabled={pending}
                required
              />
              <div>
                <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Status
                </label>
                <select
                  id="status"
                  value={currentValues.status}
                  onChange={(event) => updateField('status', event.target.value as SiteStatus)}
                  disabled={pending}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <FormField
                label="Cliente"
                name="cliente"
                value={currentValues.cliente}
                onChange={onInput('cliente')}
                placeholder="Opcional"
                disabled={pending}
              />
              <FormField
                label="Segmento"
                name="segmento"
                value={currentValues.segmento}
                onChange={onInput('segmento')}
                placeholder="Opcional"
                disabled={pending}
              />
            </div>

            {(updateError || archiveError || syncError) && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {updateError ?? archiveError ?? syncError}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button type="submit" variant="primary" disabled={pending}>
                {updateSite.isPending ? 'Salvando…' : 'Salvar alterações'}
              </Button>
              <Button type="button" onClick={() => navigate(`/sites/${id}`)} disabled={pending}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Saúde da integração</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <SyncBadge status={syncState?.status ?? null} />
              <span className="text-sm text-zinc-500">{formatRelativeTime(syncState?.lastSyncAt ?? null)}</span>
            </div>
            <p className="mt-3 text-sm text-zinc-600">
              {syncState?.errorMessage ?? 'Use este painel para ajustar a propriedade e reprocessar a coleta quando necessário.'}
            </p>
            <Button
              type="button"
              className="mt-4 w-full justify-center"
              onClick={() => triggerSync.mutate(id)}
              disabled={pending}
            >
              {triggerSync.isPending ? 'Reprocessando…' : 'Reprocessar sync'}
            </Button>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Ação estrutural</p>
            <h2 className="mt-3 text-lg font-semibold text-zinc-900">Arquivar site</h2>
            <p className="mt-2 text-sm text-zinc-600">
              O site sai da operação ativa, mas permanece no inventário e continua acessível para consulta.
            </p>
            <Button
              type="button"
              className="mt-4 w-full justify-center border-red-200 text-red-700 hover:bg-red-50"
              onClick={onArchive}
              disabled={pending || site.data.status === 'arquivado'}
            >
              {archiveSite.isPending ? 'Arquivando…' : currentSite.status === 'arquivado' ? 'Já arquivado' : 'Arquivar'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
