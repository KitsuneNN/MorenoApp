import { CartItem, CartItemInput } from '@/types/cart';

import { StateCreator } from 'zustand';

import { addDecimal, compareDecimal, isIntegerDecimal, multiplyDecimal, subtractDecimal, toMoney, toQuantity } from '@/utils/decimal';

export type CartState = {
  items: CartItem[];
  addProduct: (product: CartItemInput, quantity?: string) => boolean;
  setQuantity: (productId: string, quantity: string) => boolean;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getItemSubtotal: (productId: string) => string;
  getTotal: () => string;
  getItemCount: () => number;
};

function isValidQuantity(quantity: string, unidad: CartItem['unidad']): boolean {
  try {
    return compareDecimal(quantity, '0') > 0 && (unidad !== 'UNIDAD' || isIntegerDecimal(quantity));
  } catch {
    return false;
  }
}

function normalizedQuantity(quantity: string): string {
  return toQuantity(quantity);
}

export const createCartState: StateCreator<CartState, [], [], CartState> = (set, get) => ({
  items: [],

  addProduct: (product, quantity = '1') => {
    if (!isValidQuantity(quantity, product.unidad)) return false;

    const existing = get().items.find((item) => item.productId === product.id);
    if (existing) {
      return get().setQuantity(existing.productId, addDecimal(existing.cantidad, quantity).toString());
    }

    set((state) => ({
      items: [
        ...state.items,
        {
          productId: product.id,
          nombre: product.nombre,
          imagenUrl: product.imagen_url,
          unidad: product.unidad,
          precioUnitario: toMoney(product.precio_venta),
          cantidad: normalizedQuantity(quantity),
        },
      ],
    }));
    return true;
  },

  setQuantity: (productId, quantity) => {
    const item = get().items.find((candidate) => candidate.productId === productId);
    if (!item || !isValidQuantity(quantity, item.unidad)) return false;

    set((state) => ({
      items: state.items.map((candidate) =>
        candidate.productId === productId ? { ...candidate, cantidad: normalizedQuantity(quantity) } : candidate,
      ),
    }));
    return true;
  },

  increment: (productId) => {
    const item = get().items.find((candidate) => candidate.productId === productId);
    if (item) get().setQuantity(productId, addDecimal(item.cantidad, '1').toString());
  },

  decrement: (productId) => {
    const item = get().items.find((candidate) => candidate.productId === productId);
    if (!item) return;

    const nextQuantity = subtractDecimal(item.cantidad, '1');
    if (compareDecimal(nextQuantity, '0') <= 0) {
      get().removeItem(productId);
      return;
    }
    get().setQuantity(productId, nextQuantity.toString());
  },

  removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
  clearCart: () => set({ items: [] }),

  getItemSubtotal: (productId) => {
    const item = get().items.find((candidate) => candidate.productId === productId);
    return item ? toMoney(multiplyDecimal(item.precioUnitario, item.cantidad)) : toMoney('0');
  },

  getTotal: () => toMoney(addDecimal(...get().items.map((item) => multiplyDecimal(item.precioUnitario, item.cantidad)))),
  getItemCount: () => get().items.length,
});

