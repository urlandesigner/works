export interface SiteFormValues {
  nome: string;
  url: string;
  ga4PropertyId: string;
}

export type SiteFormErrors = Partial<Record<keyof SiteFormValues, string>>;

function isValidUrl(raw: string): boolean {
  try {
    const u = new URL(raw.includes('://') ? raw : `https://${raw}`);
    return Boolean(u.hostname) && u.hostname.includes('.');
  } catch {
    return false;
  }
}

// Normaliza a URL para persistência (garante protocolo).
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.includes('://') ? trimmed : `https://${trimmed}`;
}

export function validateSiteForm(values: SiteFormValues): SiteFormErrors {
  const errors: SiteFormErrors = {};

  if (!values.nome.trim()) {
    errors.nome = 'Informe o nome do site.';
  }

  const url = values.url.trim();
  if (!url) {
    errors.url = 'Informe a URL do site.';
  } else if (!isValidUrl(url)) {
    errors.url = 'URL inválida. Ex.: https://seusite.com';
  }

  const pid = values.ga4PropertyId.trim();
  if (!pid) {
    errors.ga4PropertyId = 'Informe o GA4 Property ID.';
  } else if (/^G-/i.test(pid)) {
    errors.ga4PropertyId = 'Esse é o Measurement ID. Use o Property ID (numérico).';
  } else if (!/^\d+$/.test(pid)) {
    errors.ga4PropertyId = 'O Property ID deve conter apenas números.';
  }

  return errors;
}
