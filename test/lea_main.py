from fastapi import FastAPI

app = FastAPI()

@app.get("/health") # 引数にはパスを指定、ドメインまでをURLに指定
# リクエストメソッドがGETでURLがドメインまでのリクエストが来た時に呼び出される
# ((.venv) ) ➜  test git:(main) ✗ uvicorn lea_main:app --reload
# 上記のコマンドで起動
def read_root():
    return {"status": "ok"}
