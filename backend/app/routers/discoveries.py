from fastapi import APIRouter, Depends, Query, HTTPException
from datetime import date
from app.schemas import DiscoveryCreate, DiscoveryResponse, DiscoveryUpdate 
from app.models import Discovery
from app.db import get_db
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Annotated
import uuid
from app.enums import Category

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
        category=Category.OTHER, 
        summary=payload.raw_text, tags=[]
    )
    db.add(discovery)
    db.commit()
    db.refresh(discovery)
    return discovery

# get一覧
@router.get("", response_model=list[DiscoveryResponse])
def list_discovery(limit: Annotated[int, Query(ge=1, le=100)] = 50, offset: Annotated[int, Query(ge=0)] = 0, db: Session = Depends(get_db)):
    stmt = select(Discovery).order_by(Discovery.discovered_at.desc(), Discovery.created_at.desc()).limit(limit).offset(offset)
    db_list = db.execute(stmt).scalars().all()
    return db_list

# get詳細
@router.get("/{discovery_id}", response_model=DiscoveryResponse)
def detail_discovery(discovery_id: uuid.UUID, db: Session = Depends(get_db)):
    discovery = db.get(Discovery, discovery_id)
    if discovery is None:
        raise HTTPException(status_code=404, detail="discovery not found")
    return discovery

# db: Annotated[Session, Depends(get_db)]とdb: Session = Depends(get_db)は同じ意味になる。学習のため、2つを使用
@router.put("/{discovery_id}", response_model=DiscoveryResponse)
def update_discovery(discovery_id: uuid.UUID, payload: DiscoveryUpdate, db: Annotated[Session, Depends(get_db)]):
    discovery = db.get(Discovery, discovery_id)
    if discovery is None:
        raise HTTPException(status_code=404, detail="discovery not found")
    discovery.title = payload.title
    discovery.category = payload.category
    discovery.summary = payload.summary
    discovery.tags = payload.tags
    discovery.discovered_at = payload.discovered_at
    db.commit()
    db.refresh(discovery)
    return discovery

@router.delete("/{discovery_id}", status_code=204)
def delete_discovery(discovery_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]):
    discovery = db.get(Discovery, discovery_id)
    if discovery is None:
        raise HTTPException(status_code=404, detail="discovery not found")
    db.delete(discovery)
    db.commit()
