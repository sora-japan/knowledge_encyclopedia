from fastapi import FastAPI
from app.routers import discoveries
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import discoveries, ask

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Daily-Remaining"]
)

app.include_router(discoveries.router)
app.include_router(ask.router)

# [コマンド] uvicorn app.main:app --reload
@app.get("/health")
def read_root():
    return {"status": "ok"}

