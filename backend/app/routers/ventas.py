from math import ceil
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.common import Page
from app.schemas.venta import VentaCreate, VentaResponse
from app.services.venta_service import VentaService

router = APIRouter(prefix='/ventas', tags=['Ventas'])
service = VentaService()


@router.get('', response_model=Page[VentaResponse])
def list_ventas(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    items, total = service.list(db, page, page_size)
    return Page(items=items, page=page, page_size=page_size, total=total, total_pages=ceil(total / page_size) if total else 0)


@router.get('/{venta_id}', response_model=VentaResponse)
def get_venta(venta_id: UUID, db: Session = Depends(get_db)):
    return service.get(db, venta_id)


@router.post('', response_model=VentaResponse, status_code=status.HTTP_201_CREATED)
def create_venta(data: VentaCreate, db: Session = Depends(get_db)):
    return service.create(db, data)
