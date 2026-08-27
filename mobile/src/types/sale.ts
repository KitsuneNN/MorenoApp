import { UnidadMedida } from '@/types/product';

export type SaleItemCreate = { producto_id: string; cantidad: string };
export type SaleCreate = { id: string; items: SaleItemCreate[] };

export type SaleDetail = {
  id: string;
  producto_id: string;
  producto_nombre: string;
  unidad: UnidadMedida;
  cantidad: string;
  precio_unitario: string;
  subtotal: string;
};

export type Sale = { id: string; total: string; created_at: string; detalles: SaleDetail[] };

export type SaleListParams = { page?: number; pageSize?: number };
