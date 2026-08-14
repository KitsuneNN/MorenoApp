import { UnidadMedida } from '@/types/product';

const labels: Record<UnidadMedida, string> = {
  UNIDAD: 'unid.',
  GRAMO: 'g',
  KILOGRAMO: 'kg',
  MILILITRO: 'ml',
  LITRO: 'L',
};

export function formatStock(stock: string, unidad: UnidadMedida) {
  const number = Number(stock);
  const quantity = unidad === 'UNIDAD' ? number.toFixed(0) : number.toLocaleString('es-AR', { maximumFractionDigits: 3 });
  return `${quantity} ${labels[unidad]}`;
}
