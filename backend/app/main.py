from fastapi import FastAPI

app = FastAPI()

# [コマンド] uvicorn app.main:app --reload
@app.get("/health")
def read_root():
    return {"status": "ok"}
