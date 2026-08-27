export const queryKeys = {
  products: (search: string, lowStock: boolean) => ['products', { search, lowStock }] as const,
  sales: () => ['sales'] as const,
  sale: (id: string) => ['sales', { id }] as const,
};
