from fastapi import FastAPI
from app.routers import discoveries

app = FastAPI()

app.include_router(discoveries.router)

# [コマンド] uvicorn app.main:app --reload
@app.get("/health")
def read_root():
    return {"status": "ok"}

