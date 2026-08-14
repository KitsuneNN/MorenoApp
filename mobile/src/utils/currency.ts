import { toMoney } from '@/utils/decimal';

// Formateo visual desde Decimal/string: no convierte un importe a Number.
export function formatCurrency(amount: string): string {
  try {
    const [integer, fraction] = toMoney(amount).split('.');
    const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$ ${grouped},${fraction}`;
  } catch {
    return '$ —';
  }
}
