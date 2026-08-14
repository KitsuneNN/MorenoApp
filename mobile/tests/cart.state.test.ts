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
  it('adds a product as a new line', () => {
    const store = cart();
    expect(store.getState().addProduct(bleach)).toBe(true);
    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().items[0].cantidad).toBe('1.000');
  });

  it('increments an existing product instead of duplicating its line', () => {
    const store = cart();
    store.getState().addProduct(bleach);
    store.getState().addProduct(bleach);
    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().items[0].cantidad).toBe('2.000');
  });

  it('accepts and normalizes fractional quantity outside UNIDAD', () => {
    const store = cart();
    expect(store.getState().addProduct(detergent, '0.5')).toBe(true);
    store.getState().addProduct(detergent, '1.250');
    expect(store.getState().items[0].cantidad).toBe('1.750');
  });

  it('calculates a fractional-line subtotal with decimal precision', () => {
    const store = cart();
    store.getState().addProduct(detergent, '1.750');
    expect(store.getState().getItemSubtotal(detergent.id)).toBe('1749.98');
  });

  it('rejects fractional quantities for UNIDAD', () => {
    const store = cart();
    expect(store.getState().addProduct(bleach, '0.5')).toBe(false);
    expect(store.getState().items).toHaveLength(0);
  });

  it('calculates totals accurately with 999.99 monetary amounts', () => {
    const store = cart();
    store.getState().addProduct(detergent, '0.5');
    store.getState().addProduct(bleach, '2');
    expect(store.getState().getItemSubtotal(detergent.id)).toBe('500.00');
    expect(store.getState().getTotal()).toBe('520.20');
  });

  it('decrements and removes a line when its quantity reaches zero', () => {
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

  it('keeps persisted cart values JSON-safe strings, never Decimal instances', () => {
    const store = cart();
    store.getState().addProduct(detergent, '0.5');
    const persisted = JSON.parse(JSON.stringify({ items: store.getState().items }));
    const item = persisted.items[0];

    expect(item.precioUnitario).toBe('999.99');
    expect(item.cantidad).toBe('0.500');
    expect(typeof item.precioUnitario).toBe('string');
    expect(typeof item.cantidad).toBe('string');
  });
});
