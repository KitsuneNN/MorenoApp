export type UnidadMedida = 'UNIDAD' | 'GRAMO' | 'KILOGRAMO' | 'MILILITRO' | 'LITRO';
export type ModoPrecioVenta = 'CALCULADO' | 'MANUAL';

// Decimal se transporta como string para conservar exactitud entre API y app.
export type Product = {
  id: string;
  codigo_barra: string | null;
  nombre: string;
  imagen_url: string | null;
  imagen_public_id: string | null;
  precio_compra: string;
  margen_ganancia: string;
  precio_venta: string;
  modo_precio_venta: ModoPrecioVenta;
  stock: string;
  stock_minimo: string;
  unidad: UnidadMedida;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductListParams = {
  search?: string;
  lowStock?: boolean;
  page?: number;
  pageSize?: number;
};
