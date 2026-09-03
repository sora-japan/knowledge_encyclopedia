from fastapi import FastAPI, Request
from app.routers import discoveries
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import discoveries, ask, export
from app.services.usage import DailyLimitExceeded
from fastapi.responses import JSONResponse

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
app.include_router(export.router)

@app.exception_handler(DailyLimitExceeded)
def daily_limit_exceeded(request: Request, exc: DailyLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "1日の利用上限に達しました"},
    )

# [コマンド] uvicorn app.main:app --reload
@app.get("/health")
def read_root():
    return {"status": "ok"}

