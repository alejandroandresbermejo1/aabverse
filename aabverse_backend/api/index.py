import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import init_db
from games.router import router as games_router
from games.aimshot.router import router as aimshot_records_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_db()
    except Exception as e:
        print("Error inicializando esquema y tablas en base de datos:", e)
    yield

app = FastAPI(
    title="AABVerse API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Api de AABVerse funcionando correctamente"}

app.include_router(games_router, prefix="/api/games")
app.include_router(aimshot_records_router, prefix="/api/games/aimshot", tags=["AimShot Records"])
app.include_router(aimshot_records_router, prefix="/api", tags=["Legacy AimShot Records"])

