import { apiClient } from '@/api/client';
import { PaginatedResponse } from '@/types/api';
import { Sale, SaleCreate, SaleListParams } from '@/types/sale';

const VENTAS_PATH = '/ventas';

export async function createSale(payload: SaleCreate): Promise<Sale> {
  const { data } = await apiClient.post<Sale>(VENTAS_PATH, payload);
  return data;
}

export async function getSales({ page = 1, pageSize = 20 }: SaleListParams = {}) {
  const { data } = await apiClient.get<PaginatedResponse<Sale>>(VENTAS_PATH, {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function getSale(id: string): Promise<Sale> {
  const { data } = await apiClient.get<Sale>(`${VENTAS_PATH}/${id}`);
  return data;
}
