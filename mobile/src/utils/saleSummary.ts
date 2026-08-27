import { SaleDetail } from '@/types/sale';

const MAX_NAMES = 2;

// Resúmenes de una venta para tarjetas y encabezados. Puras y testables.
export function countSaleItems(detalles: SaleDetail[]): string {
  const total = detalles.length;
  return total === 1 ? '1 artículo' : `${total} artículos`;
}

export function describeSaleItems(detalles: SaleDetail[]): string {
  if (detalles.length === 0) return 'Sin artículos';
  const names = detalles.slice(0, MAX_NAMES).map((detalle) => detalle.producto_nombre);
  const restantes = detalles.length - names.length;
  return restantes > 0 ? `${names.join(', ')} +${restantes} más` : names.join(', ');
}
