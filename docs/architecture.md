# Decisiones de arquitectura

## Datos y persistencia

- PostgreSQL es la única fuente de verdad para productos, precios, stock y ventas.
- Dinero: `NUMERIC(14,2)` / `Decimal`.
- Stock y cantidades: `NUMERIC(14,3)` / `Decimal`.
- Los productos se desactivan mediante baja lógica (`activo = false`).
- `codigo_barra` es opcional y solo debe ser único entre productos activos:

```sql
CREATE UNIQUE INDEX ux_productos_codigo_barra_activo
ON productos (codigo_barra)
WHERE activo = true;
```

## Confirmación de venta

- El carrito no descuenta stock.
- La confirmación se realiza en una transacción del backend.
- Las filas de los productos se bloquean mediante `SELECT ... FOR UPDATE` **ordenadas ascendentemente por `producto_id`**, sin respetar el orden recibido del carrito. Esto reduce el riesgo de deadlocks entre ventas concurrentes.
- El backend recalcula precios y totales y valida stock; no confía en los importes enviados por el cliente.

## Idempotencia

- El cliente genera un UUID para cada intención de venta.
- Si una venta ya existe para ese UUID, el backend devuelve esa venta.
- Si dos solicitudes simultáneas intentan insertar el mismo UUID, el servicio captura el error de integridad dentro de un savepoint, consulta la venta creada y la devuelve. Si el UUID se reutiliza con un payload diferente, el backend responderá un conflicto en vez de tratarlo como un reintento válido.
