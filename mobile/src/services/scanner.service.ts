import { toAppApiError } from '@/api/errors';
import { CartItemInput } from '@/types/cart';
import { Product } from '@/types/product';

export type ScannerResult =
  | { status: 'added'; product: Product }
  | { status: 'error'; message: string; code: string };

type Dependencies = {
  barcode: string;
  findProduct: (barcode: string) => Promise<Product>;
  addProduct: (product: CartItemInput) => boolean;
};

// Esta función no depende de CameraView. Hace testeable la decisión de negocio
// que une una lectura de código con la consulta de producto y el carrito.
export async function processScannedBarcode({ barcode, findProduct, addProduct }: Dependencies): Promise<ScannerResult> {
  try {
    const product = await findProduct(barcode);
    if (!addProduct(product)) {
      return { status: 'error', code: 'CART_ADD_FAILED', message: 'No pudimos agregar este producto al carrito.' };
    }
    return { status: 'added', product };
  } catch (error) {
    const apiError = toAppApiError(error);
    return {
      status: 'error',
      code: apiError.code ?? 'UNKNOWN_ERROR',
      message: apiError.code === 'PRODUCT_NOT_FOUND' ? 'Producto no encontrado. Podés intentar nuevamente.' : apiError.message,
    };
  }
}
