export function formatCurrency(amount: string): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return '$ —';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(value);
}
