import { createStore } from 'zustand/vanilla';
import { describe, expect, it } from 'vitest';

import { CartState, createCartState } from '@/stores/cart.state';
import { CartItemInput } from '@/types/cart';

const detergent: CartItemInput = {
  id: 'detergent-1', nombre: 'Detergente', imagen_url: null, unidad: 'LITRO', precio_venta: '999.99',
};
const bleach: CartItemInput = {
  id: 'bleach-1', nombre: 'Lavandina', imagen_url: null, unidad: 'UNIDAD', precio_venta: '10.10',
};

function cart() {
  return createStore<CartState>()(createCartState);
}

describe('cart state', () => {
  it('adds a product and increments an existing line instead of duplicating it', () => {
    const store = cart();
    store.getState().addProduct(bleach);
    store.getState().addProduct(bleach);

    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().items[0].cantidad).toBe('2.000');
  });

  it('supports fractional quantity outside UNIDAD and retains decimal precision in subtotal', () => {
    const store = cart();
    store.getState().addProduct(detergent, '0.5');
    store.getState().addProduct(detergent, '1.250');

    expect(store.getState().items[0].cantidad).toBe('1.750');
    expect(store.getState().getItemSubtotal(detergent.id)).toBe('1749.98');
    expect(store.getState().getTotal()).toBe('1749.98');
  });

  it('rejects fractional quantities for UNIDAD', () => {
    const store = cart();
    expect(store.getState().addProduct(bleach, '0.5')).toBe(false);
    expect(store.getState().items).toHaveLength(0);
  });

  it('calculates total with decimal arithmetic for 999.99 amounts', () => {
    const store = cart();
    store.getState().addProduct(detergent, '0.5');
    store.getState().addProduct(bleach, '2');

    expect(store.getState().getItemSubtotal(detergent.id)).toBe('500.00');
    expect(store.getState().getTotal()).toBe('520.20');
  });

  it('decrements and removes a line when the quantity reaches zero', () => {
    const store = cart();
    store.getState().addProduct(bleach);
    store.getState().decrement(bleach.id);

    expect(store.getState().items).toHaveLength(0);
  });

  it('removes a line explicitly', () => {
    const store = cart();
    store.getState().addProduct(detergent);
    store.getState().removeItem(detergent.id);

    expect(store.getState().items).toHaveLength(0);
  });
});
