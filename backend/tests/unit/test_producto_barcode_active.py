from decimal import Decimal
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy.dialects import postgresql

from app.main import app
from app.models.producto import Producto, UnidadMedida
from app.repositories.producto_repository import ProductoRepository
from app.routers.productos import service


class CapturingSession:
    def scalar(self, statement):
        self.statement = statement
        return None


def test_barcode_repository_query_only_targets_active_products() -> None:
    db = CapturingSession()
    result = ProductoRepository().get_by_barcode(db, '7791234567890')
    sql = str(db.statement.compile(dialect=postgresql.dialect(), compile_kwargs={'literal_binds': True}))

    assert result is None
    assert "productos.codigo_barra = '7791234567890'" in sql
    assert 'productos.activo IS true' in sql


def test_scanning_barcode_of_deactivated_product_returns_not_found(monkeypatch) -> None:
    # Producto creado y luego dado de baja lógica: el mismo comportamiento que
    # tendría una fila de PostgreSQL tras DELETE /productos/{id}.
    deactivated = Producto(
        id=uuid4(), codigo_barra='7791234567890', nombre='Producto discontinuado',
        precio_compra=Decimal('10.00'), margen_ganancia=Decimal('20.00'), precio_venta=Decimal('12.00'),
        stock=Decimal('1.000'), stock_minimo=Decimal('0.000'), unidad=UnidadMedida.UNIDAD, activo=False,
    )

    class RepositoryWithDeactivatedProduct:
        def get_by_barcode(self, _db, barcode):
            return deactivated if deactivated.activo and deactivated.codigo_barra == barcode else None

    monkeypatch.setattr(service, 'repository', RepositoryWithDeactivatedProduct())
    client = TestClient(app)
    response = client.get('/api/v1/productos/barcode/7791234567890')

    assert response.status_code == 404
    assert response.json() == {'detail': 'Producto no encontrado', 'code': 'PRODUCT_NOT_FOUND'}
