import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { CartState, createCartState } from './cart.state';

export type { CartState } from './cart.state';

export const useCartStore = create<CartState>()(
  persist(createCartState, {
    name: 'morenoapp-cart',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({ items: state.items }),
  }),
);
