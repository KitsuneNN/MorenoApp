export const queryKeys = {
  products: (search: string, lowStock: boolean) => ['products', { search, lowStock }] as const,
};
