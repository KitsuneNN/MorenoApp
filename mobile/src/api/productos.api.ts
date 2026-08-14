import { apiClient } from '@/api/client';
import { PaginatedResponse } from '@/types/api';
import { Product, ProductListParams } from '@/types/product';

const PRODUCTOS_PATH = '/productos';

export async function getProducts({ page = 1, pageSize = 20, search, lowStock = false }: ProductListParams = {}) {
  const { data } = await apiClient.get<PaginatedResponse<Product>>(PRODUCTOS_PATH, {
    params: {
      page,
      page_size: pageSize,
      search: search || undefined,
      low_stock: lowStock || undefined,
      active: true,
    },
  });
  return data;
}

export async function getProductByBarcode(barcode: string) {
  const { data } = await apiClient.get<Product>(`${PRODUCTOS_PATH}/barcode/${encodeURIComponent(barcode)}`);
  return data;
}
