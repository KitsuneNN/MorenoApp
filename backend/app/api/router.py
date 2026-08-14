from fastapi import APIRouter

from app.routers import productos

api_router = APIRouter()
api_router.include_router(productos.router)
