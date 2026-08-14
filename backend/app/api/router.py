from fastapi import APIRouter

from app.routers import productos, ventas

api_router = APIRouter()
api_router.include_router(productos.router)
api_router.include_router(ventas.router)
