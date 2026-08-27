import { describe, expect, it } from 'vitest';

import { SaleDetail } from '@/types/sale';
import { countSaleItems, describeSaleItems } from '@/utils/saleSummary';

function detalle(nombre: string): SaleDetail {
  return {
    id: `${nombre}-id`,
    producto_id: '1b2f5c46-1111-4111-8111-111111111111',
    producto_nombre: nombre,
    unidad: 'UNIDAD',
    cantidad: '2.000',
    precio_unitario: '10.00',
    subtotal: '20.00',
  };
}

describe('countSaleItems', () => {
  it('usa singular para exactamente un artículo', () => {
    expect(countSaleItems([detalle('Detergente')])).toBe('1 artículo');
  });

  it('usa plural para cero o varios artículos', () => {
    expect(countSaleItems([])).toBe('0 artículos');
    expect(countSaleItems([detalle('A'), detalle('B'), detalle('C')])).toBe('3 artículos');
  });
});

describe('describeSaleItems', () => {
  it('muestra el nombre único de la venta', () => {
    expect(describeSaleItems([detalle('Lavandina')])).toBe('Lavandina');
  });

  it('muestra hasta dos nombres separados por coma', () => {
    expect(describeSaleItems([detalle('Lavandina'), detalle('Detergente')])).toBe('Lavandina, Detergente');
  });

  it('resuelve el resto con +N más', () => {
    expect(describeSaleItems([detalle('A'), detalle('B'), detalle('C')])).toBe('A, B +1 más');
    expect(describeSaleItems([detalle('A'), detalle('B'), detalle('C'), detalle('D')])).toBe('A, B +2 más');
  });

  it('describe la ausencia de artículos', () => {
    expect(describeSaleItems([])).toBe('Sin artículos');
  });
});
