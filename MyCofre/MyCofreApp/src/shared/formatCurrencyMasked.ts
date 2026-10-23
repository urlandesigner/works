import { formatCurrency } from '../utils/formatCurrency';

export function formatCurrencyMasked(value: number, isHidden: boolean): string {
  return isHidden ? '••••••' : formatCurrency(value);
}
