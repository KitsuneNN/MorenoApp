from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.common import Page
from app.schemas.producto import ProductoCreate, ProductoPrecioUpdate, ProductoResponse, ProductoStockUpdate, ProductoUpdate
from app.services.producto_service import ProductoService

router = APIRouter(prefix="/productos", tags=["Productos"])
service = ProductoService()


@router.get("", response_model=Page[ProductoResponse])
def list_productos(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, max_length=160),
    low_stock: bool = False,
    active: bool | None = True,
    db: Session = Depends(get_db),
) -> Page[ProductoResponse]:
    items, total = service.list(db, page=page, page_size=page_size, search=search, low_stock=low_stock, active=active)
    return Page(items=items, page=page, page_size=page_size, total=total)


@router.get("/barcode/{codigo_barra}", response_model=ProductoResponse)
def get_producto_by_barcode(codigo_barra: str, db: Session = Depends(get_db)) -> ProductoResponse:
    return service.get_by_barcode(db, codigo_barra)


@router.get("/{producto_id}", response_model=ProductoResponse)
def get_producto(producto_id: UUID, db: Session = Depends(get_db)) -> ProductoResponse:
    return service.get(db, producto_id)


@router.post("", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
def create_producto(data: ProductoCreate, db: Session = Depends(get_db)) -> ProductoResponse:
    return service.create(db, data)


@router.put("/{producto_id}", response_model=ProductoResponse)
def update_producto(producto_id: UUID, data: ProductoUpdate, db: Session = Depends(get_db)) -> ProductoResponse:
    return service.update(db, producto_id, data)


@router.patch("/{producto_id}/stock", response_model=ProductoResponse)
def update_stock(producto_id: UUID, data: ProductoStockUpdate, db: Session = Depends(get_db)) -> ProductoResponse:
    return service.update_stock(db, producto_id, data)


@router.patch("/{producto_id}/precio", response_model=ProductoResponse)
def update_price(producto_id: UUID, data: ProductoPrecioUpdate, db: Session = Depends(get_db)) -> ProductoResponse:
    return service.update_price(db, producto_id, data)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_producto(producto_id: UUID, db: Session = Depends(get_db)) -> Response:
    service.deactivate(db, producto_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
