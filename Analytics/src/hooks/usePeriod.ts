import { useSearchParams } from 'react-router-dom';
import { resolvePeriodDays } from '@/lib/period';

// Período global (7v7) persistido na URL (?period=) — atravessa Home → Site.
export function usePeriod() {
  const [params, setParams] = useSearchParams();
  const days = resolvePeriodDays(params.get('period'));

  const setDays = (next: number) => {
    params.set('period', String(next));
    setParams(params, { replace: true });
  };

  return { days, setDays };
}
