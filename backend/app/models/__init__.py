from app.models.producto import ModoPrecioVenta, Producto, UnidadMedida

__all__ = ["Producto", "UnidadMedida", "ModoPrecioVenta"]

from app.models.venta import DetalleVenta, Venta

__all__ += ['Venta', 'DetalleVenta']
