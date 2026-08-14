import { decimal } from '@/utils/decimal';
import { UnidadMedida } from '@/types/product';

const labels: Record<UnidadMedida, string> = {
  UNIDAD: 'unid.',
  GRAMO: 'g',
  KILOGRAMO: 'kg',
  MILILITRO: 'ml',
  LITRO: 'L',
};

export function formatStock(stock: string, unidad: UnidadMedida) {
  const value = decimal(stock);
  const quantity = unidad === 'UNIDAD'
    ? value.toFixed(0)
    : value.toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1').replace('.', ',');
  return `${quantity} ${labels[unidad]}`;
}
