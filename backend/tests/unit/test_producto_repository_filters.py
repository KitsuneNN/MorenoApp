from sqlalchemy.dialects import postgresql

from app.repositories.producto_repository import ProductoRepository


class CapturingSession:
    def __init__(self) -> None:
        self.statements = []

    def scalar(self, statement):
        self.statements.append(statement)
        return 0

    def scalars(self, statement):
        self.statements.append(statement)
        return []


def test_search_and_low_stock_filters_are_combined() -> None:
    db = CapturingSession()

    products, total = ProductoRepository().list(
        db, page=1, page_size=20, search="deterg", low_stock=True, active=True
    )

    sql = str(db.statements[0].compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True}))
    assert products == []
    assert total == 0
    assert "productos.activo IS true" in sql
    assert "productos.nombre ILIKE '%%deterg%%'" in sql
    assert "productos.stock <= productos.stock_minimo" in sql
