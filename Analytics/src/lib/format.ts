const numberFormatter = new Intl.NumberFormat('pt-BR');

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

// Variação para exibição: "+12%" / "−42%" / "—" (novo/sem base).
export function formatPercent(pct: number | null): string {
  if (pct === null) return '—';
  const rounded = Math.round(pct);
  if (rounded > 0) return `+${rounded}%`;
  if (rounded < 0) return `−${Math.abs(rounded)}%`;
  return '0%';
}

// Frescor do dado: "agora" / "há 12 min" / "há 3 h" / "há 2 d".
export function formatRelativeTime(iso: string | null): string {
  if (!iso) return '—';
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `há ${days} d`;
}
