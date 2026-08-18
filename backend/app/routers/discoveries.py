from fastapi import APIRouter, Depends
from datetime import date
from app.schemas import DiscoveryCreate, DiscoveryResponse 
from app.models import Discovery
from app.db import get_db
from sqlalchemy.orm import Session

router = APIRouter(
    prefix = "/api/discoveries",
    tags = ["discoveries"]
)

# 何かを実行中であっても、他の処理を実行できる実行処理 async 非同期処理
# データを送信したい時、post
# ユーザーから２項目受け取り、８項目返す
@router.post("", response_model=DiscoveryResponse, status_code=201)
def create_discovery(payload: DiscoveryCreate, db: Session = Depends(get_db)):
    """
    発見を1件登録する。
    raw_text から title/category/summary/tags を生成して保存する。
    現在はLLM未実装のため固定値を使用（Step 5 で差し替え）。
    discovered_at が未指定の場合は当日の日付を入れる。
    """
    if payload.discovered_at is None:
        today = date.today()
        discovered_at = today
    else:
        discovered_at = payload.discovered_at
    title = payload.raw_text[:30]
    discovery = Discovery(
        raw_text=payload.raw_text, 
        title=title, 
        discovered_at=discovered_at, 
        category="その他", 
        summary=payload.raw_text, tags=[]
    )
    db.add(discovery)
    db.commit()
    db.refresh(discovery)
    return discovery

@router.get("", response_model=list[DiscoveryResponse])
def list_discovery(db: Session = Depends(get_db)):
    db.execute()
