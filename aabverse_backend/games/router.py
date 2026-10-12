from fastapi import APIRouter
from .aimshot.router import router as aimshot_router

router = APIRouter()

router.include_router(aimshot_router, prefix="/aimshot", tags=["AimShot Records"])
