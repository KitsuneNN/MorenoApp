import { Product, UnidadMedida } from '@/types/product';

export type CartItem = {
  productId: string;
  nombre: string;
  imagenUrl: string | null;
  unidad: UnidadMedida;
  precioUnitario: string;
  cantidad: string;
};

export type CartItemInput = Pick<Product, 'id' | 'nombre' | 'imagen_url' | 'unidad' | 'precio_venta'>;
