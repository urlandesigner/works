import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { useCreateSite } from '@/hooks/useSites';
import type { SiteInput } from '@/types';
import { PropertyIdHelp } from './PropertyIdHelp';
import { SubmitFeedback } from './SubmitFeedback';
import { validateSiteForm, normalizeUrl, type SiteFormValues, type SiteFormErrors } from './validateSite';

const EMPTY: SiteFormValues = { nome: '', url: '', ga4PropertyId: '' };

export function SiteCreateForm() {
  const navigate = useNavigate();
  const createSite = useCreateSite();
  const [values, setValues] = useState<SiteFormValues>(EMPTY);
  const [errors, setErrors] = useState<SiteFormErrors>({});

  const pending = createSite.isPending;
  const serverError =
    createSite.isError && createSite.error instanceof Error ? createSite.error.message : undefined;

  const update =
    (field: keyof SiteFormValues) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
      if (createSite.isError) createSite.reset();
    };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateSiteForm(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    const input: SiteInput = {
      nome: values.nome.trim(),
      url: normalizeUrl(values.url),
      ga4PropertyId: values.ga4PropertyId.trim(),
    };
    createSite.mutate(input, { onSuccess: () => navigate('/') });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormField
        label="Nome do site"
        name="nome"
        value={values.nome}
        onChange={update('nome')}
        error={errors.nome}
        placeholder="Ex.: Loja do Cliente A"
        disabled={pending}
        autoFocus
        required
      />

      <FormField
        label="URL do site"
        name="url"
        value={values.url}
        onChange={update('url')}
        error={errors.url}
        placeholder="https://seusite.com"
        disabled={pending}
        required
      />

      <div>
        <FormField
          label="GA4 Property ID"
          name="ga4PropertyId"
          value={values.ga4PropertyId}
          onChange={update('ga4PropertyId')}
          error={errors.ga4PropertyId}
          placeholder="Ex.: 123456789"
          disabled={pending}
          required
        />
        <PropertyIdHelp />
      </div>

      {pending && <SubmitFeedback status="submitting" />}
      {serverError && <SubmitFeedback status="error" message={serverError} />}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Conectando analytics…
            </>
          ) : (
            'Cadastrar site'
          )}
        </Button>
        <Button type="button" onClick={() => navigate('/')} disabled={pending}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
