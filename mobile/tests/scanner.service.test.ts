import { createStore } from 'zustand/vanilla';
import { describe, expect, it } from 'vitest';

import { CartState, createCartState } from '@/stores/cart.state';
import { processScannedBarcode } from '@/services/scanner.service';
import { Product } from '@/types/product';

const product: Product = {
  id: 'product-1', codigo_barra: '7791234567890', nombre: 'Detergente', imagen_url: null, imagen_public_id: null,
  precio_compra: '100.00', margen_ganancia: '20.00', precio_venta: '120.00', modo_precio_venta: 'CALCULADO',
  stock: '10.000', stock_minimo: '1.000', unidad: 'LITRO', activo: true,
  created_at: '2026-08-14T00:00:00Z', updated_at: '2026-08-14T00:00:00Z',
};

function cart() {
  return createStore<CartState>()(createCartState);
}

describe('processScannedBarcode', () => {
  it('adds a found product that was not in the cart', async () => {
    const store = cart();
    const result = await processScannedBarcode({ barcode: product.codigo_barra!, findProduct: async () => product, addProduct: store.getState().addProduct });

    expect(result.status).toBe('added');
    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().items[0].cantidad).toBe('1.000');
  });

  it('increments the existing cart line when the same product is scanned again', async () => {
    const store = cart();
    store.getState().addProduct(product);
    await processScannedBarcode({ barcode: product.codigo_barra!, findProduct: async () => product, addProduct: store.getState().addProduct });

    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().items[0].cantidad).toBe('2.000');
  });

  it('does not alter the cart when the barcode product is not found', async () => {
    const store = cart();
    const notFound = Object.assign(new Error('Producto no encontrado'), { isAxiosError: true, response: { status: 404, data: { detail: 'Producto no encontrado', code: 'PRODUCT_NOT_FOUND' } } });
    const result = await processScannedBarcode({ barcode: 'missing', findProduct: async () => { throw notFound; }, addProduct: store.getState().addProduct });

    expect(result).toEqual({ status: 'error', code: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado. Podés intentar nuevamente.' });
    expect(store.getState().items).toHaveLength(0);
  });
});
