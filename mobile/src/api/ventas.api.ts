import { apiClient } from '@/api/client';
import { Sale, SaleCreate } from '@/types/sale';

export async function createSale(payload: SaleCreate): Promise<Sale> {
  const { data } = await apiClient.post<Sale>('/ventas', payload);
  return data;
}
